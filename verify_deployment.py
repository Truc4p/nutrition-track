#!/usr/bin/env python3
"""
Verify that the project is ready for Vercel deployment.
Run this script before deploying to check for common issues.
"""

import os
import sys
import json
from pathlib import Path

def print_status(message, status="INFO"):
    """Print colored status message."""
    colors = {
        "OK": "\033[92m✓",
        "WARN": "\033[93m⚠",
        "ERROR": "\033[91m✗",
        "INFO": "\033[94mℹ"
    }
    reset = "\033[0m"
    print(f"{colors.get(status, colors['INFO'])} {message}{reset}")

def check_file(filepath, required=True):
    """Check if a file exists."""
    if os.path.exists(filepath):
        print_status(f"Found: {filepath}", "OK")
        return True
    else:
        status = "ERROR" if required else "WARN"
        print_status(f"Missing: {filepath}", status)
        return not required

def check_file_size(filepath, max_mb=50):
    """Check file size."""
    if os.path.exists(filepath):
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        if size_mb > max_mb:
            print_status(f"  Warning: {filepath} is {size_mb:.1f}MB (limit: {max_mb}MB)", "WARN")
            return False
        else:
            print_status(f"  Size OK: {filepath} ({size_mb:.2f}MB)", "OK")
            return True
    return True

def check_env_vars():
    """Check if environment variables are documented."""
    print("\n📋 Checking environment variables setup...")
    
    if os.path.exists('.env.example'):
        print_status("Found .env.example", "OK")
        with open('.env.example', 'r') as f:
            content = f.read()
            required_vars = ['GEMINI_KEY', 'USDA_API_KEY', 'YOUTUBE_API_KEY']
            for var in required_vars:
                if var in content:
                    print_status(f"  {var} documented", "OK")
                else:
                    print_status(f"  {var} missing from .env.example", "WARN")
    else:
        print_status(".env.example not found", "WARN")
    
    # Check if .env exists (should be ignored by git)
    if os.path.exists('.env'):
        print_status(".env file exists (make sure it's in .gitignore)", "WARN")
    
    # Check .gitignore
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            if '.env' in f.read():
                print_status(".env is in .gitignore", "OK")
            else:
                print_status(".env should be added to .gitignore", "ERROR")

def check_vercel_config():
    """Check Vercel configuration."""
    print("\n⚙️  Checking Vercel configuration...")
    
    if not check_file('vercel.json', required=True):
        return False
    
    try:
        with open('vercel.json', 'r') as f:
            config = json.load(f)
        
        # Check for required fields
        if 'builds' in config:
            print_status("Builds configuration found", "OK")
        else:
            print_status("No builds configuration", "WARN")
        
        if 'routes' in config:
            print_status(f"Routes configuration found ({len(config['routes'])} routes)", "OK")
        else:
            print_status("No routes configuration", "WARN")
        
        return True
    except json.JSONDecodeError:
        print_status("vercel.json is not valid JSON", "ERROR")
        return False

def check_dependencies():
    """Check Python dependencies."""
    print("\n📦 Checking dependencies...")
    
    if not check_file('requirements.txt', required=True):
        return False
    
    required_packages = ['flask', 'flask-cors', 'requests', 'python-dotenv']
    
    with open('requirements.txt', 'r') as f:
        content = f.read().lower()
        for package in required_packages:
            if package in content:
                print_status(f"  {package} found", "OK")
            else:
                print_status(f"  {package} missing", "WARN")
    
    return True

def check_project_structure():
    """Check project structure."""
    print("\n📁 Checking project structure...")
    
    required_files = [
        'web-ui/server.py',
        'web-ui/home.html',
        'web-ui/style.css',
    ]
    
    for file in required_files:
        check_file(file, required=True)
    
    # Check for recipe database
    recipe_db = 'meal-scraper/pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json'
    if check_file(recipe_db, required=False):
        check_file_size(recipe_db, max_mb=10)

def check_deployment_readiness():
    """Check if project is ready for deployment."""
    print("\n🚀 Checking deployment readiness...")
    
    issues = []
    
    # Check vercel.json
    if not os.path.exists('vercel.json'):
        issues.append("vercel.json is missing")
    
    # Check requirements.txt
    if not os.path.exists('requirements.txt'):
        issues.append("requirements.txt is missing (root level)")
    
    # Check web-ui/server.py
    if not os.path.exists('web-ui/server.py'):
        issues.append("web-ui/server.py is missing")
    
    # Check for .env in gitignore
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            if '.env' not in f.read():
                issues.append(".env is not in .gitignore")
    
    if issues:
        print_status("Deployment readiness: FAILED", "ERROR")
        for issue in issues:
            print_status(f"  - {issue}", "ERROR")
        return False
    else:
        print_status("Deployment readiness: PASSED", "OK")
        return True

def estimate_deployment_size():
    """Estimate total deployment size."""
    print("\n💾 Estimating deployment size...")
    
    total_size = 0
    excluded_dirs = {'.git', '__pycache__', 'node_modules', 'venv', '.expo', 
                     'mobile-app', 'docs', 'usda-database/usda_data'}
    
    for root, dirs, files in os.walk('.'):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith('.')]
        
        for file in files:
            if not file.endswith(('.pyc', '.log', '.db', '.sqlite')):
                filepath = os.path.join(root, file)
                try:
                    total_size += os.path.getsize(filepath)
                except:
                    pass
    
    size_mb = total_size / (1024 * 1024)
    
    if size_mb > 100:
        print_status(f"Estimated size: {size_mb:.1f}MB (may exceed Vercel limit)", "ERROR")
    elif size_mb > 50:
        print_status(f"Estimated size: {size_mb:.1f}MB (approaching limit)", "WARN")
    else:
        print_status(f"Estimated size: {size_mb:.1f}MB (within limits)", "OK")

def main():
    """Run all checks."""
    print("🔍 Vercel Deployment Verification\n")
    print("=" * 60)
    
    # Run checks
    check_vercel_config()
    check_dependencies()
    check_project_structure()
    check_env_vars()
    estimate_deployment_size()
    
    print("\n" + "=" * 60)
    ready = check_deployment_readiness()
    
    print("\n📚 Next Steps:")
    if ready:
        print("  1. Make sure you have your API keys ready")
        print("  2. Push code to Git repository")
        print("  3. Deploy with: vercel")
        print("  4. Add environment variables in Vercel dashboard")
        print("  5. Redeploy with: vercel --prod")
        print("\n  See VERCEL_DEPLOYMENT.md for detailed instructions")
    else:
        print("  1. Fix the issues listed above")
        print("  2. Run this script again")
        print("  3. See VERCEL_DEPLOYMENT.md for help")
    
    return 0 if ready else 1

if __name__ == "__main__":
    sys.exit(main())

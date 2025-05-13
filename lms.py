import lmstudio as lms

# Use the available model
model = lms.llm("qwen2.5-0.5b-instruct-mlx")
result = model.respond("What is the meaning of life?")

print(result)
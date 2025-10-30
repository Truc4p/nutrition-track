import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { recipeService, youtubeService } from '../services/api';
import { Recipe, YouTubeVideo } from '../types';

const MealSearchScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'videos'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load initial content
    loadRecipes('');
    loadVideos('');
  }, []);

  const loadRecipes = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await recipeService.search(query, 40);
      if (response.results) {
        setRecipes(response.results);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideos = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await youtubeService.getVideos(query, 40);
      if (response.success && response.results) {
        setVideos(response.results);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'recipes') {
      loadRecipes(searchInput);
    } else {
      loadVideos(searchInput);
    }
  };

  const openRecipe = (url: string) => {
    Linking.openURL(url);
  };

  const openVideo = (url: string) => {
    Linking.openURL(url);
  };

  const renderRecipeCard = (recipe: Recipe) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.card}
      onPress={() => openRecipe(recipe.url)}
    >
      <Image source={{ uri: recipe.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.cardInfo}>
          <Ionicons name="time-outline" size={16} color={Colors.textLight} />
          <Text style={styles.cardTime}>{recipe.timeDisplay}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVideoCard = (video: YouTubeVideo) => (
    <TouchableOpacity
      key={video.id}
      style={styles.card}
      onPress={() => openVideo(video.video_url)}
    >
      <Image source={{ uri: video.thumbnail_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.cardChannel} numberOfLines={1}>{video.channel_title}</Text>
        <View style={styles.cardInfo}>
          <Ionicons name="time-outline" size={16} color={Colors.textLight} />
          <Text style={styles.cardTime}>{video.duration}</Text>
          <Ionicons name="eye-outline" size={16} color={Colors.textLight} style={{ marginLeft: 10 }} />
          <Text style={styles.cardViews}>{video.view_count.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heroTitle}>Discover Delicious Recipes</Text>
        <Text style={styles.heroSubtitle}>Find healthy and tasty meals for your nutrition plan</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipes or videos..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Ionicons name="search" size={24} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Videos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'recipes' ? (
          <View style={styles.grid}>
            {recipes.map(renderRecipeCard)}
          </View>
        ) : (
          <View style={styles.grid}>
            {videos.map(renderVideoCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 30,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  searchSection: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.secondary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  grid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: Colors.backgroundLight,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
    minHeight: 36,
  },
  cardChannel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  cardViews: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default MealSearchScreen;

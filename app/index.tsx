import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ExternalLink } from "@/components/ExternalLink";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { searchBusinesses } from "@/services/yelpApi";

// Define the Restaurant type
type Restaurant = {
  id: string;
  name: string;
  image_url: string;
  categories: { title: string; alias: string }[];
  rating: number;
  review_count: number;
  price: string;
};

// Define the Filters type
type Filters = {
  sortBy: string;
  cuisine: string;
  priceRange: string;
};

const CategoryItem = ({
  image,
  title,
  description,
  index,
}: {
  image: string;
  title: string;
  description: string;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: index * 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.category, { opacity: fadeAnim }]}>
      <Image source={{ uri: image }} style={styles.categoryImage} />
      <ThemedText style={styles.categoryTitle}>{title}</ThemedText>
      <ThemedText style={styles.categoryDescription}>{description}</ThemedText>
    </Animated.View>
  );
};

const LocalityItem = ({ title, count }: { title: string; count: number }) => (
  <TouchableOpacity style={styles.locality}>
    <ThemedText style={styles.localityTitle}>{title}</ThemedText>
    <ThemedText style={styles.localityCount}>({count} places)</ThemedText>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "relevance",
    cuisine: "all",
    priceRange: "all",
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    const data = await searchBusinesses("restaurants", "New York");
    setRestaurants(data);
    setFilteredRestaurants(data);
    setIsLoading(false);
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    const filtered = restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    if (filters.cuisine !== "all") {
      filtered = filtered.filter((restaurant) =>
        restaurant.categories.some((category) =>
          category.alias.includes(filters.cuisine)
        )
      );
    }

    if (filters.priceRange !== "all") {
      filtered = filtered.filter(
        (restaurant) => restaurant.price === filters.priceRange
      );
    }

    if (filters.sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === "review_count") {
      filtered.sort((a, b) => b.review_count - a.review_count);
    }

    setFilteredRestaurants(filtered);
    setFilterModalVisible(false);
  };

  return (
    <Animated.ScrollView
      style={styles.container}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero Section */}
      <ThemedView style={styles.hero}>
        <Animated.Text style={[styles.logo, { opacity: headerTextOpacity }]}>
          Zomato
        </Animated.Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={24}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search for restaurant, cuisine or a dish"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color="#CB202D" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Restaurants Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Restaurants</ThemedText>
        {isLoading ? (
          <ActivityIndicator size="large" color="#CB202D" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                name={restaurant.name}
                image={restaurant.image_url}
                cuisine={restaurant.categories[0].title}
                rating={restaurant.rating}
                price={restaurant.price}
              />
            ))}
          </ScrollView>
        )}
      </ThemedView>

      {/* Categories Section */}
      <ThemedView style={styles.categories}>
        <CategoryItem
          image="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=300&h=300&q=80"
          title="Order Online"
          description="Get food delivered to your doorstep"
          index={0}
        />
        <CategoryItem
          image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&h=300&q=80"
          title="Dine Out"
          description="Explore the best restaurants in town"
          index={1}
        />
        <CategoryItem
          image="https://images.unsplash.com/photo-1570872626485-d8ffea69f463?auto=format&fit=crop&w=300&h=300&q=80"
          title="Nightlife & Clubs"
          description="Discover the city's vibrant nightlife"
          index={2}
        />
      </ThemedView>

      {/* Localities Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Popular localities in and around [City]
        </ThemedText>
        <View style={styles.localities}>
          <LocalityItem title="Downtown" count={388} />
          <LocalityItem title="Midtown" count={257} />
          <LocalityItem title="Uptown" count={155} />
          <LocalityItem title="West End" count={203} />
          <LocalityItem title="East Side" count={189} />
          <LocalityItem title="Suburb Area" count={122} />
        </View>
      </ThemedView>

      {/* App Promo Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Get the Zomato app</ThemedText>
        <View style={styles.appPromo}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=200&h=400&q=80",
            }}
            style={styles.appImage}
          />
          <View style={styles.appButtons}>
            <ThemedText style={styles.appPromoText}>
              Download the app from
            </ThemedText>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>App Store</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>Google Play</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* Explore Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Explore options near me
        </ThemedText>
        <ThemedText style={styles.exploreItem}>
          Popular cuisines near me
        </ThemedText>
        <ThemedText style={styles.exploreItem}>
          Popular restaurant types near me
        </ThemedText>
        <ThemedText style={styles.exploreItem}>
          Top Restaurant Chains
        </ThemedText>
        <ThemedText style={styles.exploreItem}>Cities We Deliver To</ThemedText>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          © 2024 Zomato Clone. All rights reserved.
        </ThemedText>
        <View style={styles.footerLinks}>
          <ExternalLink href="https://www.zomato.com/about">
            <ThemedText type="link" style={styles.footerLink}>
              About Zomato
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.zomato.com/blog">
            <ThemedText type="link" style={styles.footerLink}>
              Blog
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.zomato.com/careers">
            <ThemedText type="link" style={styles.footerLink}>
              Work With Us
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.zomato.com/contact">
            <ThemedText type="link" style={styles.footerLink}>
              Contact Us
            </ThemedText>
          </ExternalLink>
        </View>
      </ThemedView>

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
      />
    </Animated.ScrollView>
  );
}

const RestaurantCard = ({
  name,
  image,
  cuisine,
  rating,
  price,
}: {
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  price: string;
}) => (
  <View style={styles.restaurantCard}>
    <Image source={{ uri: image }} style={styles.restaurantImage} />
    <ThemedText style={styles.restaurantName}>{name}</ThemedText>
    <ThemedText style={styles.restaurantInfo}>{cuisine}</ThemedText>
    <View style={styles.restaurantMeta}>
      <ThemedText style={styles.restaurantRating}>⭐ {rating}</ThemedText>
      <ThemedText style={styles.restaurantPrice}>{price}</ThemedText>
    </View>
  </View>
);

const CuisineItem = ({ name, icon }: { name: string; icon: string }) => (
  <View style={styles.cuisineItem}>
    <ThemedText style={styles.cuisineIcon}>{icon}</ThemedText>
    <ThemedText style={styles.cuisineName}>{name}</ThemedText>
  </View>
);

// Update the FilterModal component
type FilterModalProps = {
  isVisible: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  applyFilters: () => void;
};

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  filters,
  setFilters,
  applyFilters,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Filters</ThemedText>
              <FilterOption
                title="Sort by"
                options={[
                  { label: "Relevance", value: "relevance" },
                  { label: "Rating", value: "rating" },
                  { label: "Review Count", value: "review_count" },
                ]}
                selected={filters.sortBy}
                onSelect={(value) => setFilters({ ...filters, sortBy: value })}
              />
              <FilterOption
                title="Cuisines"
                options={[
                  { label: "All", value: "all" },
                  { label: "Italian", value: "italian" },
                  { label: "Chinese", value: "chinese" },
                  { label: "Mexican", value: "mexican" },
                ]}
                selected={filters.cuisine}
                onSelect={(value) => setFilters({ ...filters, cuisine: value })}
              />
              <FilterOption
                title="Price Range"
                options={[
                  { label: "All", value: "all" },
                  { label: "$", value: "$" },
                  { label: "$$", value: "$$" },
                  { label: "$$$", value: "$$$" },
                  { label: "$$$$", value: "$$$$" },
                ]}
                selected={filters.priceRange}
                onSelect={(value) =>
                  setFilters({ ...filters, priceRange: value })
                }
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <ThemedText style={styles.applyButtonText}>
                  Apply Filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Update the FilterOption component
type FilterOptionProps = {
  title: string;
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
};

const FilterOption: React.FC<FilterOptionProps> = ({
  title,
  options,
  selected,
  onSelect,
}) => (
  <View style={styles.filterOption}>
    <ThemedText style={styles.filterOptionTitle}>{title}</ThemedText>
    <View style={styles.filterOptionItems}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.filterOptionItem,
            selected === option.value && styles.filterOptionItemSelected,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <ThemedText
            style={[
              styles.filterOptionItemText,
              selected === option.value && styles.filterOptionItemTextSelected,
            ]}
          >
            {option.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CB202D",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    width: "100%",
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    padding: 5,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  category: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "30%",
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#CB202D",
    textAlign: "center",
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    padding: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  localities: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  locality: {
    width: "48%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  localityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  localityCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  appPromo: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  appImage: {
    width: 100,
    height: 200,
    marginRight: 20,
    borderRadius: 10,
  },
  appButtons: {
    flex: 1,
  },
  appPromoText: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#CB202D",
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  exploreItem: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  footer: {
    padding: 30,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerLink: {
    fontSize: 14,
    color: "#CB202D",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  featuredRestaurants: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  restaurantCard: {
    width: 250,
    marginRight: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: "100%",
    height: 150,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    padding: 10,
  },
  restaurantInfo: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 10,
  },
  restaurantMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  restaurantRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CB202D",
  },
  restaurantPrice: {
    fontSize: 14,
    color: "#666",
  },
  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cuisineItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  cuisineIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  cuisineName: {
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filterOption: {
    marginBottom: 20,
  },
  filterOptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  filterOptionItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOptionItem: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionItemText: {
    color: "#333",
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: "#CB202D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filterOptionItemSelected: {
    backgroundColor: "#CB202D",
  },
  filterOptionItemTextSelected: {
    color: "#fff",
  },
});

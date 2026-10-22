import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { IconButton } from '../../components/IconButton';
import { FavoriteButton } from '../../components/FavoriteButton';
import { RatingBadge } from '../../components/RatingBadge';
import { QuantityStepper } from '../../components/QuantityStepper';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomModal } from '../../components/CustomModal';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleFavoriteFood } from '../../store/slices/restaurantsSlice';
import { addToCart, resolveConflictReplace, dismissConflict } from '../../store/slices/cartSlice';
import { SizeOption, AddOnOption } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

type FoodDetailsRouteProp = RouteProp<RootStackParamList, 'FoodDetails'>;

export const FoodDetailsScreen: React.FC<{ route: FoodDetailsRouteProp }> = ({
  route,
}) => {
  const { foodItemId, restaurantId } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const foodItem = useAppSelector((s) =>
    s.restaurants.foodItems.find((f) => f.id === foodItemId)
  );
  const restaurant = useAppSelector((s) =>
    s.restaurants.restaurants.find((r) => r.id === restaurantId)
  );
  const favoriteFoodIds = useAppSelector((s) => s.restaurants.favoriteFoodIds);
  const isFavorite = favoriteFoodIds.includes(foodItemId);

  const cartState = useAppSelector((s) => s.cart);

  // Customization state
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(
    foodItem?.sizeOptions && foodItem.sizeOptions.length > 0
      ? foodItem.sizeOptions[0]
      : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [foodImgUri, setFoodImgUri] = useState(foodItem?.image);

  // Calculate live item price
  const unitPrice = useMemo(() => {
    if (!foodItem) return 0;
    let p = foodItem.price;
    if (selectedSize) {
      p += selectedSize.priceDelta;
    }
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
    return p + addOnsTotal;
  }, [foodItem, selectedSize, selectedAddOns]);

  if (!foodItem || !restaurant) {
    return (
      <AppScreen safeTop safeBottom>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  const totalPrice = unitPrice * quantity;
  const bottomBarClearance = 56 + Math.max(insets.bottom, 16) + 20;

  const handleToggleAddOn = (addOn: AddOnOption) => {
    triggerHaptic('selection');
    if (selectedAddOns.some((a) => a.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
    triggerHaptic('success');
    dispatch(
      addToCart({
        foodItem,
        quantity,
        selectedSize,
        selectedAddOns,
        specialInstructions,
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
      })
    );

    // If there is no conflict, go back
    if (
      !cartState.restaurantId ||
      cartState.restaurantId === restaurant.id ||
      cartState.items.length === 0
    ) {
      navigation.goBack();
    }
  };

  return (
    <AppScreen safeTop={false} safeBottom={false} keyboardAvoiding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Large Food Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: foodImgUri }}
            onError={() => setFoodImgUri('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80')}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={[styles.topControls, { top: Math.max(insets.top, 16) + 4 }]}>
            <IconButton
              icon={<Ionicons name="arrow-back" size={20} color={colors.textPrimary} />}
              onPress={() => navigation.goBack()}
              size={42}
              variant="surface"
            />
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() => dispatch(toggleFavoriteFood(foodItem.id))}
              size={42}
            />
          </View>
        </View>

        {/* Content Details */}
        <View style={styles.detailsCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{foodItem.name}</Text>
              <Text style={styles.restaurantName}>from {restaurant.name}</Text>
            </View>
            <RatingBadge rating={foodItem.rating} reviewCount={foodItem.reviewCount} />
          </View>

          <Text style={styles.description}>{foodItem.description}</Text>

          {/* Quick Info Tags */}
          <View style={styles.infoTagsRow}>
            {foodItem.calories && (
              <View style={styles.infoTag}>
                <Ionicons name="fitness-outline" size={14} color={colors.primary} />
                <Text style={styles.infoTagText}>{foodItem.calories} kcal</Text>
              </View>
            )}
            {foodItem.preparationTime && (
              <View style={styles.infoTag}>
                <Ionicons name="timer-outline" size={14} color={colors.primary} />
                <Text style={styles.infoTagText}>{foodItem.preparationTime}</Text>
              </View>
            )}
            {foodItem.isSpicy && (
              <View style={[styles.infoTag, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flame" size={14} color={colors.error} />
                <Text style={[styles.infoTagText, { color: colors.error }]}>Spicy</Text>
              </View>
            )}
            {foodItem.isVegetarian && (
              <View style={[styles.infoTag, { backgroundColor: '#EAF7EE' }]}>
                <Ionicons name="leaf" size={14} color={colors.success} />
                <Text style={[styles.infoTagText, { color: colors.success }]}>Vegetarian</Text>
              </View>
            )}
          </View>

          {/* Size Options (if present) */}
          {foodItem.sizeOptions && foodItem.sizeOptions.length > 0 && (
            <View style={styles.customSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUIRED</Text>
                </View>
              </View>

              <View style={styles.optionsList}>
                {foodItem.sizeOptions.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <TouchableOpacity
                      key={size.id}
                      style={[
                        styles.optionRow,
                        isSelected ? styles.optionRowSelected : null,
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setSelectedSize(size);
                      }}
                    >
                      <View style={styles.radioRow}>
                        <View style={[styles.radioCircle, isSelected ? styles.radioSelected : null]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.optionName}>{size.name}</Text>
                      </View>
                      <Text style={styles.optionPrice}>
                        {size.priceDelta > 0 ? `+PKR ${size.priceDelta}` : 'Standard'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Add-ons (if present) */}
          {foodItem.addOns && foodItem.addOns.length > 0 && (
            <View style={styles.customSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Add Extras</Text>
                <Text style={styles.optionalText}>OPTIONAL</Text>
              </View>

              <View style={styles.optionsList}>
                {foodItem.addOns.map((addOn) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <TouchableOpacity
                      key={addOn.id}
                      style={[
                        styles.optionRow,
                        isSelected ? styles.optionRowSelected : null,
                      ]}
                      onPress={() => handleToggleAddOn(addOn)}
                    >
                      <View style={styles.radioRow}>
                        <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]}>
                          {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        <Text style={styles.optionName}>{addOn.name}</Text>
                      </View>
                      <Text style={styles.optionPrice}>+PKR {addOn.price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Special Instructions */}
          <View style={styles.customSection}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsContainer}>
              <TextInput
                style={styles.instructionsInput}
                placeholder="e.g. Extra spicy, no onions, dressing on the side..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
              />
            </View>
          </View>
        </View>

        {/* Extra bottom clearance dynamically calculated to clear the fixed bottom action bar */}
        <View style={{ height: bottomBarClearance }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          shadows.floating,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.bottomBarContent}>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => setQuantity((q) => q + 1)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            size="md"
          />

          <PrimaryButton
            title={`Add to Cart • PKR ${totalPrice}`}
            onPress={handleAddToCart}
            variant="primary"
            size="lg"
            gradient
            style={styles.addCartBtn}
          />
        </View>
      </View>

      {/* Single Restaurant Cart Conflict Modal */}
      <CustomModal
        visible={cartState.conflictModalVisible}
        onClose={() => dispatch(dismissConflict())}
        iconName="alert-circle"
        iconColor={colors.warning}
        iconBgColor={colors.warningSoft}
        title="Start New Order?"
        description={`Your cart currently contains items from "${cartState.pendingConflict?.currentRestaurantName}". Would you like to clear the cart and add this dish from "${restaurant.name}"?`}
        primaryButtonTitle="Clear Cart & Add"
        onPrimaryPress={() => {
          triggerHaptic('success');
          dispatch(resolveConflictReplace());
          navigation.goBack();
        }}
        secondaryButtonTitle="Keep Current Cart"
        onSecondaryPress={() => dispatch(dismissConflict())}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width,
    height: 280,
    position: 'relative',
    backgroundColor: '#EBE2D8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -24,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  restaurantName: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDeep,
    fontWeight: '700',
    marginTop: 2,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  infoTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  infoTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  customSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  requiredBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  requiredText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFAF6',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  instructionsContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xs,
  },
  instructionsInput: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addCartBtn: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  backLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '700',
  },
});


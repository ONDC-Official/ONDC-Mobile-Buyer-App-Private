import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CATEGORIES} from '../../../../utils/categories';
import {useAppTheme} from '../../../../utils/theme';

interface Categories {
  currentCategory: string;
}

const Categories: React.FC<Categories> = ({currentCategory}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);

  const navigateToCategory = (category: any) => {
    if (category.shortName !== currentCategory) {
      navigation.navigate('CategoryDetails', {
        category: category.shortName,
        domain: category.domain,
      });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.category}
            onPress={() => navigateToCategory(item)}>
            <View
              style={[
                styles.imageContainer,
                item.shortName === currentCategory
                  ? styles.selected
                  : styles.normal,
              ]}>
              <FastImage source={item.Icon} style={styles.image} />
            </View>
            <Text
              variant={'labelMedium'}
              style={styles.categoryText}
              ellipsizeMode={'tail'}
              numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.name}
      />
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingLeft: 16,
      paddingTop: 16,
    },
    categoryText: {
      textAlign: 'center',
    },
    category: {
      alignItems: 'center',
      marginRight: 24,
      width: 58,
    },
    imageContainer: {
      height: 56,
      width: 56,
      marginBottom: 6,
      backgroundColor: colors.neutral100,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 28,
    },
    image: {
      height: 44,
      width: 44,
    },
    selected: {
      borderColor: colors.primary,
    },
    normal: {
      borderColor: colors.neutral100,
    },
  });

export default Categories;

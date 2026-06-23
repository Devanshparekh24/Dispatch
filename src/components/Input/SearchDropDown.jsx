import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from '@react-native-vector-icons/ionicons';

const SearchDropDown = ({
  data = [],
  value,
  setValue,
  label = 'Select Vehicle',
  placeholder = 'Select item',
  searchPlaceholder = 'Search...',
  iconName = 'car-outline',
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View>
      {(value || isFocus) && (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          {label}
        </Text>
      )}

      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : '...'}
        searchPlaceholder={searchPlaceholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocus ? 'blue' : 'black'}
            style={styles.icon}
          />
        )}
      />
    </View>
  );
};

export default SearchDropDown;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: -8,
    zIndex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
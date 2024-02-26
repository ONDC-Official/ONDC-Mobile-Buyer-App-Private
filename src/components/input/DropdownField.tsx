import DropDown from 'react-native-paper-dropdown';
import {HelperText, Text} from 'react-native-paper';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '../../utils/theme';

const DropdownField: React.FC<any> = ({required = false, label, ...props}) => {
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <View>
      <DropDown
        {...props}
        label={
          required ? (
            <Text style={styles.label}>
              {label}
              <Text style={styles.required}> *</Text>
            </Text>
          ) : (
            label
          )
        }
        mode={'outlined'}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
      />
      {props.error && (
        <HelperText padding="none" type="error" visible={props.error}>
          {props.errorMessage}
        </HelperText>
      )}
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    label: {backgroundColor: colors.white},
    required: {color: colors.red},
  });

export default DropdownField;

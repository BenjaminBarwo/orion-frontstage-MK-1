import { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, error, secureTextEntry, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasSecureEntry = secureTextEntry !== undefined;
    const actualSecureEntry = hasSecureEntry && !isPasswordVisible;

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              error && styles.inputError,
              style,
            ]}
            placeholderTextColor={authTheme.colors.muted}
            secureTextEntry={actualSecureEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {hasSecureEntry && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={authTheme.colors.muted}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: authTheme.spacing.md,
  },
  label: {
    color: authTheme.colors.muted,
    fontSize: authTheme.typography.caption,
    marginBottom: authTheme.spacing.xs,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: authTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: authTheme.colors.inputBorder,
    borderRadius: authTheme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: authTheme.colors.white,
    fontSize: 16,
    lineHeight: 22,
  },
  inputFocused: {
    borderColor: authTheme.colors.inputBorderFocused,
  },
  inputError: {
    borderColor: authTheme.colors.error,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    color: authTheme.colors.error,
    fontSize: authTheme.typography.caption,
    marginTop: authTheme.spacing.xs,
  },
});

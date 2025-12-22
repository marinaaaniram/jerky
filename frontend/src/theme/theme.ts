import type { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  primaryColor: 'blue',

  // Default color scheme
  colorScheme: 'light',

  colors: {
    blue: [
      '#e3f2fd',
      '#bbdefb',
      '#90caf9',
      '#64b5f6',
      '#42a5f5',
      '#2196f3',
      '#1e88e5',
      '#1976d2',
      '#1565c0',
      '#0d47a1',
    ],
    gray: [
      '#fafafa',
      '#f5f5f5',
      '#eeeeee',
      '#e0e0e0',
      '#bdbdbd',
      '#9e9e9e',
      '#757575',
      '#616161',
      '#424242',
      '#212121',
    ],
  },

  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  // Типография
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600' as any,
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.3', fontWeight: '700' as any },
      h2: { fontSize: '1.75rem', lineHeight: '1.35', fontWeight: '700' as any },
      h3: { fontSize: '1.4375rem', lineHeight: '1.4', fontWeight: '600' as any },
      h4: { fontSize: '1.1875rem', lineHeight: '1.45', fontWeight: '600' as any },
      h5: { fontSize: '1rem', lineHeight: '1.5', fontWeight: '600' as any },
      h6: { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: '600' as any },
    },
  },

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: '"Courier New", monospace',

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  } as any,

  lineHeights: {
    xs: 1.2,
    sm: 1.3,
    md: 1.5,
    lg: 1.6,
    xl: 1.7,
  } as any,

  // Компоненты
  components: {
    // Button
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: '500' as any,
          transition: 'all 0.2s ease',
        },
      },
    },

    // Input fields
    TextInput: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        input: {
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },

    Select: {
      defaultProps: {
        size: 'md',
      },
    },

    Textarea: {
      defaultProps: {
        size: 'md',
      },
    },

    // Cards
    Card: {
      defaultProps: {
        padding: 'lg',
      },
      styles: {
        root: {
          border: '1px solid var(--mantine-color-gray-2)',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: 'var(--mantine-shadow-sm)',
          },
        },
      },
    },

    // Table
    Table: {
      styles: {
        th: {
          fontWeight: '600' as any,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderBottom: '2px solid var(--mantine-color-gray-2)',
        },
        td: {
          paddingTop: '0.875rem',
          paddingBottom: '0.875rem',
        },
      },
    },

    // Modal
    Modal: {
      styles: {
        header: {
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        },
      },
    },

    // Loader
    Loader: {
      defaultProps: {
        size: 'md',
      },
    },

    // Badge
    Badge: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: '500' as any,
        },
      },
    },

    // AppShell
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'var(--mantine-color-gray-0)',
          minHeight: '100vh',
        },
      },
    },

    // Container
    Container: {
      defaultProps: {
        size: 'xl',
      },
    },

    // Group
    Group: {
      defaultProps: {
        gap: 'md',
      },
    },

    // Stack
    Stack: {
      defaultProps: {
        gap: 'md',
      },
    },

    // SimpleGrid
    SimpleGrid: {
      defaultProps: {
        spacing: 'lg',
      },
    },
  },

  // Тени (Material Design 3)
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 15px 35px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)',
  },
};

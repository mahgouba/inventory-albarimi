import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { AppearanceSettings } from '@shared/schema';

// Function to convert hex color to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

export function useTheme() {
  const queryClient = useQueryClient();
  
  // Fetch appearance settings
  const { data: settings, isLoading } = useQuery<AppearanceSettings>({
    queryKey: ['/api/appearance'],
    refetchOnWindowFocus: false,
  });

  // Mutation for updating dark mode
  const updateDarkModeMutation = useMutation({
    mutationFn: (darkMode: boolean) => 
      apiRequest('PUT', '/api/appearance', { darkMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appearance'] });
    },
  });

  // Apply theme when settings change
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Apply colors if available
      if (settings.primaryColor) {
        const primaryHsl = hexToHsl(settings.primaryColor);
        root.style.setProperty('--dynamic-primary', `hsl(${primaryHsl})`);
      }
      
      if (settings.secondaryColor) {
        const secondaryHsl = hexToHsl(settings.secondaryColor);
        root.style.setProperty('--dynamic-secondary', `hsl(${secondaryHsl})`);
      }
      
      if (settings.accentColor) {
        const accentHsl = hexToHsl(settings.accentColor);
        root.style.setProperty('--dynamic-accent', `hsl(${accentHsl})`);
      }

      // Apply dark mode
      if (settings.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Apply RTL layout
      if (settings.rtlLayout !== false) {
        root.setAttribute('dir', 'rtl');
        document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
      } else {
        root.setAttribute('dir', 'ltr');
        document.body.style.fontFamily = "'Inter', sans-serif";
      }

      // Update page title if company name is set
      if (settings.companyName) {
        document.title = settings.companyName;
      }
    }
  }, [settings]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newDarkMode = !settings?.darkMode;
    updateDarkModeMutation.mutate(newDarkMode);
  };

  return {
    settings,
    isLoading,
    companyName: settings?.companyName || 'إدارة المخزون',
    companyNameEn: settings?.companyNameEn || 'Inventory System',
    companyLogo: settings?.companyLogo,
    primaryColor: settings?.primaryColor || '#0f766e',
    secondaryColor: settings?.secondaryColor || '#0891b2',
    accentColor: settings?.accentColor || '#BF9231',
    darkMode: settings?.darkMode || false,
    rtlLayout: settings?.rtlLayout !== false,
    toggleDarkMode,
    isUpdatingDarkMode: updateDarkModeMutation.isPending,
  };
}
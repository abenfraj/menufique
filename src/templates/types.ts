export interface TemplateData {
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  };
  menu: {
    name: string;
    categories: {
      name: string;
      description?: string;
      dishes: {
        name: string;
        description?: string;
        price: string;
        allergens: string[];
        isAvailable: boolean;
        imageUrl?: string;
      }[];
    }[];
  };
  customization: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
  };
  branding: {
    showWatermark: boolean;
  };
  aiDesignHtml?: string;
  aiBackgroundUrl?: string;
}

export interface TemplateComponent {
  (props: { data: TemplateData }): React.ReactElement;
}

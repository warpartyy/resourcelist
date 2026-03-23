export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          role: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          role?: string | null;
        };
        Update: {
          display_name?: string | null;
          email?: string | null;
          role?: string | null;
        };
        Relationships: [];
      };

      // ✅ ADD THIS
      resources: {
        Row: {
          id: string;
          slug: string | null;
          organization: string | null;
          counties_served: string[] | null;
          phone: string | null;
          website: string | null;
          application_link: string | null;
          address: string | null;
          description: string | null;
          services: string[] | null;
          eligibility: string | null;
          last_verified: string | null;
          subcategories: string[] | null;
          tags: string[] | null;
          source_submission_id: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          parent_categories: string[] | null;
          status: string | null;
          email: string | null;
          is_tribal: boolean | null;
          tribe: string | null;
          submitted_at: string | null;
          admin_notes: string | null;
          last_edited_by: string | null;
          last_edited_at: string | null;
          last_edited_email: string | null;
          last_edited_name: string | null;
          tribal_eligibility: string | null;
        };
        Insert: any;
        Update: any;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
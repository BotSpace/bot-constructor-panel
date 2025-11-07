interface AuthData {
  id: number;
  last_login: string;
  is_superuser: boolean;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  phone: string;
  username: string;
  validated_at: string;
  role: string;
}

interface GetMeResponse {
  status: boolean;
  data: AuthData;
}

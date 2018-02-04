export class User {
    id: number;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    skype: string;
    facebook: string;
    linkedin: string;
    role: number;

    avatar_name: string;
    avatar_uid: number;
    current_sign_in_at: string;
    current_sign_in_ip: string;
    encrypted_password: string;
    firm_id: number;
    last_sign_in_at: string;
    last_sign_in_ip: string;
    remember_created_at: string;
    reset_password_sent_at: string;
    reset_password_token: string;
    sign_in_count: number;
    time_zone: number;
    stats: Object;

    constructor(username) {
        this.username = username;
    }
}
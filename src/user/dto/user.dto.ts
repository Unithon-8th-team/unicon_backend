export class User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  profileImage?: string;
  birthdate?: string;
  sex?: string;
  coin?: number;
  remainingDailyChatCount?: number;

  constructor(data: Partial<User>) {
    this.id = data.id!;
    this.name = data.name!;
    this.email = data.email!;
    this.nickname = data.nickname!;
    this.profileImage = data.profileImage;
    this.birthdate = data.birthdate;
    this.sex = data.sex;

    this.coin = data.coin ?? 200; // 값이 없으면 200으로 기본 설정
    this.remainingDailyChatCount = data.remainingDailyChatCount ?? 5; // 없으면 5로 기본 설정
  }
}

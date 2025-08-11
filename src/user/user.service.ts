import { Injectable } from '@nestjs/common';
import { SettingRequestDto } from './dto';

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  profileImage?: string;
  birthdate?: string;
  sex?: string;
}

@Injectable()
export class UserService {
  constructor() {}
  private users: User[] = [];

  /**
   * 가입된 유저인지 확인
   * @param email 유저 이메일
   * @returns true(가입됨) / false(가입 안됨)
   */
  isUserRegistered(email: string): boolean {
    return this.users.some((user) => user.email === email);
  }

  // 유저 프로필이 완성되었는지 확인
  isUserSettingCompleted(email: string): boolean {
    const user = this.users.find((user) => user.email === email);
    return user ? !!(user.nickname && user.birthdate && user.sex) : false;
  }

  settingUserProfile(email, settingData: SettingRequestDto): User {
    const index = this.users.findIndex((user) => user.email === email);
    if (index === -1) {
      throw new Error(`User with ${email} not found`);
    }

    // 기존 유저 정보 + 새 settingData 병합
    const updatedUser = { ...this.users[index], ...settingData };

    // 배열에 반영
    this.users[index] = updatedUser;

    return updatedUser;
  }

  /**
   * 유저 정보 조회
   * @param id 유저 ID
   * @returns User 객체 또는 undefined
   */
  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  /**
   * 유저 추가 (테스트용)
   * @param user 유저 객체
   */
  addUser(user: User): void {
    if (this.isUserRegistered(user.email)) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    this.users.push(user);
  }
}

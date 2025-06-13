import bcrypt from 'bcrypt';
import { User } from '../types/user';

const password: string = bcrypt.hashSync('121212', 10);

const initialUsers: User[] = [
  {
    name: 'Admin',
    email: 'admin@email.com',
    password: password,
    phone: '0000000000',
    role: 'admin',
    image:
      'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png',
  },
  {
    name: 'User',
    email: 'user@email.com',
    password: password,
    phone: '0000000000',
    role: 'user',
    is_banned: true,
    image:
      'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/45.png',
  },
];

for (let i = 1; i < 10; i++) {
  initialUsers.push({
    name: `User ${i + 1}`,
    email: `user${i + 1}@email.com`,
    password: password,
    phone: `00000000${String(i + 1).padStart(2, '0')}`,
    role: 'user',
    image:
      i % 2 === 0
        ? 'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/45.png'
        : 'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png',
  });
}
export default initialUsers;

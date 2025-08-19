import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Тестовый пользователь',
    },
  })

  console.log('✅ Пользователь создан:', user)

  // Создаем несколько тестовых постов
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Добро пожаловать в мой блог!',
        content: 'Это мой первый пост в блоге. Здесь я буду делиться своими мыслями и опытом.',
        authorId: user.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'О программировании',
        content: 'Программирование - это искусство решения проблем с помощью кода. Каждый день я узнаю что-то новое.',
        authorId: user.id,
      },
    }),
  ])

  console.log('✅ Посты созданы:', posts)

  console.log('🎉 База данных успешно заполнена!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

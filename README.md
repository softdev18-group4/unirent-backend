# Unirent

# Project Setup

## Requirements

- npm
- node 18.x

Install Dependencies

```
npm i
```

Serve Development Server

```
npm run start:dev
```

# Prisma Setup
 
## DB Pull 
ใช้สำหรับดึง Model Schema ใน database

```
npx prisma db pull
```

## Update Model Schema
ขั้นตอนหลังจากแก้ Schema หรือ สร้างเพิ่ม
```
npx prisma generate
npx prisma db push
```

# Development
สำหรับคนที่ยังไม่มีได้ setup husky
```
npm run setup
```

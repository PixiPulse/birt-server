# BIRT Server

## Technologies

Backend: ExpressJS, Prisma ORM, TypeScript


## Run this project

Create `.env` file with following variables

```
DATABASE_URL=postgresql://username:randompassword@localhost:5432/mydb?schema=public
SESSION_SECRET=GENERATE_CODE_AND_ADD
```

To generate `SESSION_SECRET` key,

```bash
openssl rand -base64 32
```

```bash
npm install
npx prisma generate
```

To run on dev server,

```bash
npm run dev
```

For build and move to production

```bash
npm run build
npm run start
```


## Testing
### Create and seed database
Run the following command to create your database. 

```bash
npx prisma migrate dev --name init
```

To prepopulate with data,

```bash
npx prisma db seed
```

### Testing the endpoints
The tests can be run using:

```bash
npm test
```
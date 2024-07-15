# `solana-vault PoC contract and test page`

## Getting Started

### Install dependencies:

```bash
yarn
```

### Prepare the environment:

```bash
cp .env.example .env
```

### Rum mock CeFi server in separate terminal:

```bash
yarn cefi_mock
```

### Run the development server (for local development):

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Start next app (for Docker image)

```bash
yarn build
yarn start
```

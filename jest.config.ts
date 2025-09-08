import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    rootDir: '.',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1', // apunta a src real, no dentro de /test
    },
    testPathIgnorePatterns: ['<rootDir>/dist/'], // opcional pero recomendado
};

export default config;

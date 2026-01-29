import { describe, it, expect } from 'vitest';
import { validateRegister, validateArticle } from '../utils/validators.js';

describe('validateRegister (unit test)', () => {
  it('debería devolver error si el email es inválido', () => {
    const errors = validateRegister({
      name: 'Juan',
      email: 'correo-invalido',
      password: '123456',
    });

    expect(errors.email).toBe('Email inválido');
  });

  it('debería devolver error si el nombre está vacío', () => {
    const errors = validateRegister({
      name: '',
      email: 'juan@test.com',
      password: '123456',
    });

    expect(errors.name).toBe('El nombre es obligatorio');
  });

  it('debería devolver error si la contraseña es muy corta', () => {
    const errors = validateRegister({
      name: 'Juan',
      email: 'juan@test.com',
      password: '123',
    });

    expect(errors.password).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('debería devolver {} si todo es válido', () => {
    const errors = validateRegister({
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: '123456',
    });

    expect(errors).toEqual({});
  });
});

describe('validateArticle (unit test)', () => {
  it('debería devolver error si el nombre está vacío', () => {
    const errors = validateArticle({
      name: '',
      quantity: 5,
    });

    expect(errors.name).toBe('El nombre del artículo es obligatorio');
  });

  it('debería devolver error si la cantidad es negativa', () => {
    const errors = validateArticle({
      name: 'Leche',
      quantity: -1,
    });

    expect(errors.quantity).toBe('La cantidad debe ser un número positivo');
  });

  it('debería devolver {} si todo es válido', () => {
    const errors = validateArticle({
      name: 'Leche',
      quantity: 5,
    });

    expect(errors).toEqual({});
  });
});

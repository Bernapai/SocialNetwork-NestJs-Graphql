# SocialNest - Red Social Básica

Este proyecto es una API de red social básica construida con **NestJS**, **GraphQL** y **MongoDB (Mongoose)**. Permite a los usuarios registrarse, enviar solicitudes de amistad, publicar actualizaciones, dar "me gusta" a publicaciones y ver las actividades de sus amigos.

---

## 🧱 Tecnologías utilizadas

- **NestJS** - Framework modular y escalable para Node.js
- **GraphQL** - Enfoque Code First usando `@nestjs/graphql`
- **MongoDB** con **Mongoose**
- **Apollo Server** - Servidor para GraphQL
- **JWT** - Autenticación con tokens


---

## 🧠 Arquitectura

El proyecto sigue una **arquitectura modular basada en servicios en capas**, lo que significa:

- Cada módulo (como `users`, `posts`, `auth`) es independiente y autocontenido.
- Dentro de cada módulo hay una separación clara entre:
  - **Resolvers** (interfaz GraphQL)
  - **Services** (lógica de negocio)
  - **Schemas/DTOs** (definiciones de datos)
  - **Module** (modulo general)

Esto facilita la escalabilidad, el mantenimiento y los tests unitarios.

---

## ✅ Funcionalidades principales

- Registro e inicio de sesión de usuarios
- Crear y consultar publicaciones
- Dar y quitar "me gusta" a publicaciones
- Enviar, aceptar y rechazar solicitudes de amistad
- Ver publicaciones de amigos
- Documentación Swagger de endpoints REST
- (En desarrollo) Actualizaciones en tiempo real con GraphQL Subscriptions

---
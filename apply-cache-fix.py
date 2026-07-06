#!/usr/bin/env python3
import sys

def replace_once(path, old, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    count = content.count(old)
    if count != 1:
        print(f"FALLO [{label}] en {path}: se esperaba 1 coincidencia, se encontraron {count}")
        sys.exit(1)
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK: {path} [{label}]")

API = "apps/web/src/lib/api.ts"
AUTH_PROVIDER = "apps/web/src/auth/AuthProvider.tsx"

replace_once(
    API,
    "let refreshRequest: Promise<string> | null = null;",
    "let refreshRequest: Promise<string> | null = null;\n\n"
    "// Permite que AuthProvider se entere cuando este modulo (fuera de React)\n"
    "// fuerza un logout por token invalido/expirado, para limpiar tanto el\n"
    "// estado de usuario como la cache de React Query.\n"
    "let forcedLogoutHandler: (() => void) | null = null;\n\n"
    "export function setForcedLogoutHandler(handler: (() => void) | null) {\n"
    "  forcedLogoutHandler = handler;\n"
    "}\n\n"
    "function handleForcedLogout() {\n"
    "  clearTokens();\n"
    "  forcedLogoutHandler?.();\n"
    "}",
    "agregar setForcedLogoutHandler")

replace_once(
    API,
    "    if (!refreshToken) {\n"
    "      clearTokens();\n"
    "      return Promise.reject(new Error('No refresh token available'));\n"
    "    }",
    "    if (!refreshToken) {\n"
    "      handleForcedLogout();\n"
    "      return Promise.reject(new Error('No refresh token available'));\n"
    "    }",
    "usar handleForcedLogout (sin refresh token)")

replace_once(
    API,
    "      .catch((error: unknown) => {\n"
    "        clearTokens();\n"
    "        throw error;\n"
    "      })",
    "      .catch((error: unknown) => {\n"
    "        handleForcedLogout();\n"
    "        throw error;\n"
    "      })",
    "usar handleForcedLogout (refresh fallido)")

replace_once(
    API,
    "      if (error.response?.status === 401) {\n"
    "        clearTokens();\n"
    "      }\n\n"
    "      return Promise.reject(error);",
    "      if (error.response?.status === 401) {\n"
    "        handleForcedLogout();\n"
    "      }\n\n"
    "      return Promise.reject(error);",
    "usar handleForcedLogout (401 no reintentable)")

replace_once(
    API,
    "    } catch {\n"
    "      clearTokens();\n"
    "      return Promise.reject(error);\n"
    "    }",
    "    } catch {\n"
    "      handleForcedLogout();\n"
    "      return Promise.reject(error);\n"
    "    }",
    "usar handleForcedLogout (retry fallido)")

replace_once(
    AUTH_PROVIDER,
    "import { api } from '../lib/api';",
    "import { api, setForcedLogoutHandler } from '../lib/api';",
    "importar setForcedLogoutHandler")

replace_once(
    AUTH_PROVIDER,
    "  useEffect(() => {\n"
    "    const timeoutId = window.setTimeout(() => {\n"
    "      void reloadUser();\n"
    "    }, 0);\n\n"
    "    return () => window.clearTimeout(timeoutId);\n"
    "  }, [reloadUser]);",
    "  useEffect(() => {\n"
    "    const timeoutId = window.setTimeout(() => {\n"
    "      void reloadUser();\n"
    "    }, 0);\n\n"
    "    return () => window.clearTimeout(timeoutId);\n"
    "  }, [reloadUser]);\n\n"
    "  useEffect(() => {\n"
    "    // Si lib/api.ts fuerza un logout (token invalido/expirado fuera de\n"
    "    // una llamada explicita a logout()), limpiamos igual el usuario y\n"
    "    // la cache de React Query para no arrastrar datos de la sesion anterior.\n"
    "    setForcedLogoutHandler(() => {\n"
    "      setUser(null);\n"
    "      queryClient.clear();\n"
    "    });\n\n"
    "    return () => setForcedLogoutHandler(null);\n"
    "  }, [queryClient]);",
    "registrar el handler de logout forzado")

print("\nTodos los cambios se aplicaron correctamente.")

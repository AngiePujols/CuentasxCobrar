// Configuración de la API para conectar con los endpoints externos
const API_BASE_URL = "https://localhost:7238/api";

// Función para validar cédula dominicana
function validaCedula(ced: string): boolean {
  if (!ced) return false;

  const c = ced.replace(/-/g, "");

  // Verificar longitud mínima
  if (c.length < 11) return false;

  // Verificar que solo contenga números
  if (!/^\d+$/.test(c)) return false;

  const cedula = c.substr(0, c.length - 1);
  const verificador = Number.parseInt(c.substr(c.length - 1, 1));
  let suma = 0;

  for (let i = 0; i < cedula.length; i++) {
    const mod = i % 2 === 0 ? 1 : 2;
    let res = Number.parseInt(cedula.substr(i, 1)) * mod;

    if (res > 9) {
      const resStr = res.toString();
      const uno = Number.parseInt(resStr.substr(0, 1));
      const dos = Number.parseInt(resStr.substr(1, 1));
      res = uno + dos;
    }
    suma += res;
  }

  const elNumero = (10 - (suma % 10)) % 10;

  // Validar que el verificador coincida y que no empiece con 000
  return elNumero === verificador && cedula.substr(0, 3) !== "000";
}

export class ApiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || "GET"} ${url}`);

    const config: RequestInit = {
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Log request body for debugging
    if (config.body) {
      console.log("Request Body:", config.body);
    }

    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          // Ignore error parsing response
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        console.log("Response Data:", responseData);
        return responseData;
      } else {
        const responseText = await response.text();
        console.log("Response Text:", responseText);
        return responseText;
      }
    } catch (error) {
      console.error("API request failed:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(`No se pudo conectar al servidor en ${API_BASE_URL}. Verifique que:
1. El servidor esté ejecutándose en https://localhost:7238
2. El certificado SSL esté configurado correctamente
3. Las políticas CORS permitan conexiones desde este dominio
4. El firewall no esté bloqueando la conexión`);
      }
      throw error;
    }
  }

  // Asientos Contables
  static async getAsientosContables() {
    return this.request("/AsientosContables");
  }

  static async getAsientoContable(id: number) {
    return this.request(`/AsientosContables/${id}`);
  }

  static async createAsientoContable(data: any) {
    return this.request("/AsientosContables", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateAsientoContable(id: number, data: any) {
    return this.request(`/AsientosContables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteAsientoContable(id: number) {
    return this.request(`/AsientosContables/${id}`, {
      method: "DELETE",
    });
  }

  // Tipos de Documentos
  static async getTiposDocumentos() {
    return this.request("/TiposDocumentos");
  }

  static async getTipoDocumento(id: number) {
    return this.request(`/TiposDocumentos/${id}`);
  }

  static async createTipoDocumento(data: any) {
    return this.request("/TiposDocumentos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTipoDocumento(id: number, data: any) {
    return this.request(`/TiposDocumentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteTipoDocumento(id: number) {
    return this.request(`/TiposDocumentos/${id}`, {
      method: "DELETE",
    });
  }

  // Transacciones
  static async getTransacciones() {
    return this.request("/Transacciones");
  }

  static async getTransaccion(id: number) {
    return this.request(`/Transacciones/${id}`);
  }

  static async createTransaccion(data: any) {
    return this.request("/Transacciones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTransaccion(id: number, data: any) {
    return this.request(`/Transacciones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteTransaccion(id: number) {
    return this.request(`/Transacciones/${id}`, {
      method: "DELETE",
    });
  }

  // Clientes
  static async getClientes() {
    try {
      return await this.request("/Clientes");
    } catch (error) {
      console.error("Error fetching clientes:", error);
      throw new Error(
        `Error al obtener clientes: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  static async getCliente(id: number) {
    try {
      return await this.request(`/Clientes/${id}`);
    } catch (error) {
      console.error("Error fetching cliente:", error);
      throw new Error(
        `Error al obtener cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  static async createCliente(data: any) {
    try {
      // Validate required fields
      if (!data.nombre || !data.cedula) {
        throw new Error("Nombre y cédula son campos requeridos");
      }

      // Validate cedula format and checksum
      if (!validaCedula(data.cedula)) {
        throw new Error(
          "La cédula ingresada no es válida. Verifique el formato y dígito verificador."
        );
      }

      return await this.request("/Clientes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error creating cliente:", error);
      throw new Error(
        `Error al crear cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  static async updateCliente(id: number, data: any) {
    try {
      // Validate required fields
      if (!data.nombre || !data.cedula) {
        throw new Error("Nombre y cédula son campos requeridos");
      }

      // Validate cedula format and checksum
      if (!validaCedula(data.cedula)) {
        throw new Error(
          "La cédula ingresada no es válida. Verifique el formato y dígito verificador."
        );
      }

      return await this.request(`/Clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error updating cliente:", error);
      throw new Error(
        `Error al actualizar cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  static async deleteCliente(id: number) {
    try {
      return await this.request(`/Clientes/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting cliente:", error);
      throw new Error(
        `Error al eliminar cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  // Función pública para validar cédula (para uso en componentes)
  static validarCedula(cedula: string): boolean {
    return validaCedula(cedula);
  }
}

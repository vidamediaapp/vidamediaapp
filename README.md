# Vida Media 🛡️📱
> **Aplicación de Supervivencia Financiera para la Clase Trabajadora Chilena**

¡Bienvenido al repositorio de **Vida Media**! Este proyecto nace como una solución de software disruptiva frente al sobreendeudamiento crítico que afecta a la clase trabajadora en Chile. A diferencia de las plataformas tradicionales orientadas a refinanciar o reinsertar al deudor en el consumo masivo, Vida Media está diseñada desde la vereda del deudor: una herramienta de protección, educación y defensa legal activa.

El proyecto está construido como una aplicación móvil híbrida moderna, interactiva y de alto impacto UI/UX.

---

## 🚀 Características Principales (Los 4 Pilares)

### 📊 Módulo A: Informe de Supervivencia (Visualización Avanzada)
* **Gráficos de Exposición Activa:** Implementación de gráficos de torta y barras dinámicos mediante **Chart.js** para ilustrar la concentración de deuda por acreedor (BancoEstado, Falabella, Ripley, Caja Los Andes).
* **Calendario de Vencimientos:** Panel interactivo en Ionic para prever y anticipar las fechas de pago del mes, evitando intereses moratorios.
* **Conversor UF a CLP:** Conexión en tiempo real para visualizar el costo real en pesos de los créditos indexados.

### 🧠 Módulo B: Inteligencia Financiera y Simulación
* **Simulador CMF Proactivo:** Calculadora avanzada con *sliders* configurada según las fases reales de implementación de la nueva normativa CMF (2026-2028) para el pago mínimo y el Monto No Financiable.
* **Algoritmos de Recomendación:** Motor en el backend que automatiza y prioriza estrategias de salida mediante los métodos **Bola de Nieve** (alivio psicológico rápido) y **Avalancha** (ahorro matemático de intereses).

### 🎓 Módulo C: Educación y Refuerzo (Microlearning)
* **Tooltips Emergentes (`<ion-popover>`):** Ventanas contextuales explicativas integradas en el flujo para democratizar términos como el CAE o el interés compuesto en el momento exacto de necesidad.
* **Cápsulas Deslizables (*Swipes*):** Tarjetas dinámicas con tips diarios sobre derechos del consumidor y finanzas prácticas.

### 🛡️ Módulo D: Defensa Legal y Match Estatal
* **Motor de Alertas Inteligentes:** Algoritmo de perfilamiento que detecta de forma autónoma ratios críticos de endeudamiento (Deuda/Ingreso > 2x) y sugiere amparos bajo la Ley 20.720.
* **Derivación Activa:** Chatbot basado en reglas con enlaces de acción directa (CTA) para denunciar acoso extrajudicial (Ley 19.496) directamente ante el SERNAC.

---

## 🛠️ Stack Tecnológico

### Frontend
* **Framework:** Ionic Framework (Híbrido)
* **Gráficos:** Chart.js / Ngx-charts
* **Componentes de UI:** Web Components nativos de Ionic (`<ion-popover>`, `<ion-slides>`)

### Backend & Base de Datos
* **ORM:** TypeORM
* **Estrategia de Inicialización:** TypeORM Seeders para la precarga automatizada de la tabla de acreedores con las tasas vigentes del retail chileno.
* **Integraciones:** API externa de la Comisión para el Mercado Financiero (CMF).

---

## 📦 Instalación y Configuración

Sigue estos pasos para clonar y ejecutar el entorno de desarrollo de forma local.

### Prerrequisitos
* **Node.js** (v18 o superior recomendado)
* **Ionic CLI** instalado globalmente:
```bash
  npm install -g @ionic/cli
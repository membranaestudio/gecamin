class AssetsManager {
  constructor() {
    // Array para almacenar las promesas de carga de recursos
    this.promises = [];
  }

  // Método para cargar recursos
  load({
    type = undefined, // Tipo de recurso: script | stylesheet
    src = null, // URL del recurso
    id = null, // Identificador del recurso en el DOM
    inline = null, // Contenido del recurso si se va a cargar en línea
    preload = false, // Indicador de si se debe precargar el recurso
    refElement, // Elemento de referencia para insertar el recurso en el DOM
    version = null, // Versión del recurso
    timeout = 30000, // Tiempo máximo de espera para la carga del recurso
    cache = true, // Indicador de si se debe cachear el recurso
    cb = null // Función de retorno de llamada al completarse la carga
  }) {
    return new Promise((resolve, reject) => {
      // Evitar cargar un recurso si ya está pendiente de carga y se va a cachear
      if (cache && id in this.promises) {
        // Devolver la promesa de carga existente
        this.promises[id].then(resolve, reject);
        return;
      }

      // Cargar recurso CSS
      if (type === 'style') {
        const stylePromise = this._loadStyle({
          src,
          id,
          inline,
          preload,
          refElement,
          timeout,
          version,
          cb
        });

        this.promises[id] = stylePromise;
        return stylePromise.then(resolve, reject);

      // Cargar recurso JS
      } else if (type === 'script') {
        const scriptPromise = this._loadScript({
          src,
          id,
          inline,
          preload,
          refElement,
          timeout,
          version,
          cb
        });

        this.promises[id] = scriptPromise;

        return scriptPromise.then(resolve, reject);

      // Tipo de recurso desconocido
      } else {
        reject(new TypeError('El tipo de recurso "style" o "script" falta.'));
      }
    });
  }

  // Método interno para cargar un script
  _loadScript({
    src = null,
    id = null,
    inline = null,
    preload = false,
    refElement = document.body,
    version = null,
    timeout = 15000,
    cb = null
  }) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(`script[src="${src}"]`); // Comprobar si el script ya está cargado
      const head = document.getElementsByTagName('head')[0]; // Obtener la referencia al elemento <head>

      let script, timer, preloadEl;

      // Si el elemento no existe y no se va a cargar en línea
      if ((typeof element === 'undefined' || element === null) && !inline) {
        // Agregar versión a la URL si está presente
        if (src && version) {
          src += `?ver=${version}`;
        }

        // Precargar el recurso si está configurado
        if (src && preload) {
          preloadEl = document.createElement('link');
          preloadEl.setAttribute('rel', 'preload');
          preloadEl.setAttribute('href', src);
          preloadEl.setAttribute('as', 'script');
          preloadEl.setAttribute('type', 'text/javascript');
          head.prepend(preloadEl);
        }

        // Crear el elemento <script> y configurar sus atributos
        script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');

        if (src) {
          script.setAttribute('async', 'async');
          script.setAttribute('src', src);
          script.setAttribute('crossorigin', 'anonymous');
        }

        // Generar un ID si no se proporciona uno
        if (!id) {
          const timestamp = Math.round(new Date().getTime() / 1000);
          id = `ajax-asset-${timestamp}-js`;
        }

        script.setAttribute('id', id);

        // Establecer el contenido si se carga en línea
        if (typeof inline === 'string' && inline.length) {
          script.innerHTML = inline;
        }

        // Insertar el script en el DOM
        refElement.append(script);

        // Manejar errores de carga del script
        if (src) {
          script.onerror = (error) => {
            cleanup();
            refElement.removeChild(script);
            script = null;
            reject(new Error(`Se produjo un error de red al intentar cargar el recurso ${src}`));
          }

          // Manejar la carga exitosa del script
          if (script.onreadystatechange === undefined) {
            script.onload = onload;
          } else {
            script.onreadystatechange = onload;
          }

          // Establecer un temporizador de espera
          timer = setTimeout(script.onerror, timeout);

        } else {
          // Resolver la promesa si no se proporciona una URL de script
          resolve(script);
        }

      } else {
        // Resolver la promesa si el script ya está cargado
        resolve(element);
      }

      // Función para limpiar el temporizador y los manejadores de eventos
      function cleanup() {
        clearTimeout(timer);
        timer = null;
        script.onerror = script.onreadystatechange = script.onload = null;
      }

      // Función para manejar la carga exitosa del script
      function onload() {
        cleanup();
        if (!script.onreadystatechange || (script.readyState && script.readyState === 'complete')) {
          // Ejecutar la función de retorno de llamada si está definida
          if (typeof cb === 'function') {
            cb();
          }

          // Resolver la promesa
          resolve(script);
          return;
        }
      }
    });
  }	

  // Método interno para cargar un estilo
  _loadStyle({
    src = null,
    id = null,
    inline = null,
    preload = false,
    refElement,
    version = null,
    timeout = 15000,
    cb = null
  }) {
    return new Promise((resolve, reject) => {
      const isInlineStyle = typeof inline === 'string' && inline.length;

      // Comprobar si se proporciona un ID
      if (!id) {
        reject(new TypeError('Falta el atributo ID del recurso.'));
      }

      // Comprobar si ya existe un elemento con el mismo ID
      const sameIdElement = document.getElementById(id);

      let link = isInlineStyle ? document.createElement('style') : document.createElement('link');
      let timer, sheet, cssRules, preloadEl, c = (timeout || 10) * 100;

      // Agregar versión a la URL si está presente
      if (src && version) {
        src += `?ver=${version}`;
      }

      // Precargar el recurso si está configurado
      if (src && preload) {
        preloadEl = document.createElement('link');
        preloadEl.setAttribute('rel', 'preload');
        preloadEl.setAttribute('href', src);
        preloadEl.setAttribute('as', 'style');
        preloadEl.setAttribute('type', 'text/css');
        document.head.prepend(preloadEl);
      }

      // Configurar el elemento de estilo
      if (isInlineStyle) {
        link.innerHTML = inline;
        link.setAttribute('id', id);
        link.setAttribute('type', 'text/css');
      } else {
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('id', id);
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);

        // Establecer crossorigin solo si no se está precargando
        if (!preload) {
          link.setAttribute('crossorigin', 'anonymous');
        }
      }

      // Insertar el elemento en el DOM
      if (typeof refElement !== 'undefined' && refElement !== null) {
        refElement.insertAdjacentElement('afterend', link);
      } else {
        document.head.append(link);
      }

      // Manejar errores de carga del estilo
      link.onerror = function (error) {
        if (timer) {
          clearInterval(timer);
        }
        timer = null;

        reject(new Error(`Se produjo un error de red al intentar cargar el recurso ${src}`));
      };

      // Obtener las reglas CSS del estilo
      if ('sheet' in link) {
        sheet = 'sheet';
        cssRules = 'cssRules';
      } else {
        sheet = 'styleSheet';
        cssRules = 'rules';
      }

      // Establecer un temporizador para verificar si se han cargado las reglas CSS
      timer = setInterval(function () {
        try {
          if (link[sheet] && link[sheet][cssRules].length) {
            clearInterval(timer);
            timer = null;

            // Ejecutar la función de retorno de llamada si está definida
            if (typeof cb === 'function') {
              cb();
            }

            // Resolver la promesa
            resolve(link);

            // Eliminar el elemento antiguo con el ID duplicado
            if (sameIdElement) {
              sameIdElement.remove();
            }
            return;
          }
        } catch (e) { }

        // Manejar el tiempo de espera
        if (c-- < 0) {
          clearInterval(timer);
          timer = null;
          reject(new Error(`Se produjo un error de red al intentar cargar el recurso ${src}`));
        }
      }, 10);
    });
  }

  // Método para inyectar una precarga de recurso
  injectPreload({
    src = null, // URL del recurso
    refElement = document.head.querySelector('meta[charset]'), // Elemento de referencia para insertar la precarga en el DOM
    rel = 'prefetch', // Tipo de precarga: prefetch o preload
    crossorigin = 'anonymous', // Atributo crossorigin
    as = 'script', // Atributo as
    type = 'application/javascript' // Tipo MIME del recurso
  } = {}) {
    // No precargar si el elemento ya existe
    if (src && !document.head.querySelector(`link[rel="${rel}"][href="${src}"]`) && !document.querySelector(`script[src="${src}"]`)) {
      const el = document.createElement('link');

      el.setAttribute('href', src);
      el.setAttribute('rel', rel);
      el.setAttribute('as', as);
      el.setAttribute('crossorigin', crossorigin);
      el.setAttribute('type', type);

      // Insertar el elemento en el DOM
      if (refElement) {
        refElement.insertAdjacentElement('afterend', el);
      } else {
        document.head.prepend(el);
      }
    }
  }
};

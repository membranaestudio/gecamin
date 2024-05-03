class Utilities {
  constructor() {
    // Handlers para eventos de redimensionamiento y cambio de orientación
    this._handlers = {
      resize: this.debounce(this._updateMobileBarVh.bind(this), this.getDebounceTime(300)),
      orientationchange: this.debounce(ScrollTrigger.refresh.bind(ScrollTrigger, false), this.getDebounceTime())
    };

    // Últimos tamaños de ventana guardados
    this.lastVW = window.innerWidth;
    this.lastVH = window.innerHeight;

    // Media query para detectar dispositivos con mouse
    this.mqPointer = window.matchMedia(`(hover: hover) and (pointer: fine)`);

    // Inicializar las funciones al instanciar
    this.init();
  }

  // Inicializar
  init() {
    this._attachEvents(); // Adjuntar eventos
  }

  // Actualizar
  update() {
    this._updateMobileBarVh(); // Actualizar barra móvil
  }

  // Destruir
  destroy() {
    this._detachEvents(); // Desvincular eventos
  }

  // Adjuntar eventos
  _attachEvents() {
    // Adjuntar evento de redimensionamiento
    this.attachResponsiveResize({
      callback: this._handlers.resize,
      autoDetachOnTransitionStart: false
    });

    // Adjuntar evento de cambio de orientación
    window.addEventListener('orientationchange', this._handlers.orientationchange);
  }

  // Desvincular eventos
  _detachEvents() {
    window.removeEventListener('orientationchange', this._handlers.orientationchange);
  }

  // Adjuntar redimensionamiento responsivo
  attachResponsiveResize({
    callback,
    immediateCall = true,
    autoDetachOnTransitionStart = true
  } = {}) {
    const self = this;

    if (typeof callback === 'function') {
      const cb = callback.bind(callback);

      // Manejadores de cambio de tamaño de ventana
      function changeHandlerVW(event) {
        if (this.lastVW !== window.innerWidth) {
          this.lastVW = window.innerWidth;
          cb();
        }
      }

      function changeHandlerVH(event) {
        if (this.lastVH !== window.innerHeight) {
          this.lastVH = window.innerHeight;
          cb();
        }
      }

      // Función para manejar los cambios
      const cbWidth = changeHandlerVW.bind(changeHandlerVW);
      const cbHeight = changeHandlerVH.bind(changeHandlerVH);

      function changeHandler(event, runCallback = false) {
        if (event.matches) {
          window.addEventListener('resize', cbHeight, false);
        } else {
          window.removeEventListener('resize', cbHeight, false);
        }

        if (!!runCallback) {
          cb();
        }
      }

      // Limpiar eventos
      function clear() {
        window.removeEventListener('resize', cbWidth, false);
        window.removeEventListener('resize', cbHeight, false);

        if (typeof self.mqPointer.removeEventListener === 'function') {
          self.mqPointer.removeEventListener('change', changeHandler);
        } else {
          self.mqPointer.removeListener(changeHandler);
        }
      }

      window.addEventListener('resize', cbWidth, false);

      // Manejar el cambio de puntero
      changeHandler({ matches: self.mqPointer.matches }, immediateCall);

      if (typeof self.mqPointer.addEventListener === 'function') {
        self.mqPointer.addEventListener('change', changeHandler);
      } else {
        self.mqPointer.addListener(changeHandler);
      }

      // Desvincular eventos durante la transición de Barba
      if (!!autoDetachOnTransitionStart) {
        document.addEventListener('arts/barba/transition/start', clear, { once: true });
      }

      return { clear };
    }
  }

  // Actualizar altura de la barra móvil
  _updateMobileBarVh() {
    document.documentElement.style.setProperty('--fix-bar-vh', `${document.documentElement.clientHeight * 0.01}px`);
    ScrollTrigger.refresh(true);
  }

  // Desplazarse a un destino
  scrollTo({
    target = 0,
    ease = 'expo.inOut',
    delay = 0,
    duration = 0.8,
    offset = 0,
    container = window,
    cb = undefined
  }) {
    // Comprobar si el desplazamiento suave está habilitado
    const scrollRef = app.componentsManager.getComponentByName('Scroll');
    const isSmoothScroll = this.isSmoothScrollingEnabled() && scrollRef && scrollRef.instance;

    // Comprobar si la duración es cero
    if (duration === 0) {
      // Establecer posición instantánea
      if (isSmoothScroll) {
        return gsap.set(container, {
          delay,
          scrollTo: { y: target, offsetY: offset },
          onComplete: () => {
            scrollRef.instance.scrollTo(target, { immediate: true, offset: -offset, force: true });

            if (typeof cb === 'function') {
              cb();
            }
          }
        });
      } else {
        return gsap.set(container, {
          delay,
          scrollTo: target,
          onComplete: () => {
            if (typeof cb === 'function') {
              cb();
            }
          }
        });
      }
    } else {
      // Animación de desplazamiento
      if (isSmoothScroll) {
        return gsap.to(container, {
          duration,
          delay,
          ease,
          onStart: () => {
            scrollRef.instance.scrollTo(target, {
              duration,
              offset: -offset,
              easing: gsap.parseEase(ease)
            });
          },
          onComplete: () => {
            if (typeof cb === 'function') {
              cb();
            }
          }
        });
      } else {
        return gsap.to(container, {
          duration,
          delay,
          scrollTo: { y: target, offsetY: offset },
          ease,
          onComplete: () => {
            if (typeof cb === 'function') {
              cb();
            }
          }
        });
      }
    }
  }

  // Bloquear/desbloquear el desplazamiento
  scrollLock(lock = true) {
    const scrollRef = app.componentsManager.getComponentByName('Scroll');
    const lockClass = 'lock-scroll';

    document.documentElement.classList.toggle(lockClass, lock);

    if (this.isSmoothScrollingEnabled() && scrollRef.instance) {
      if (lock) {
        scrollRef.instance.stop();
      } else {
        scrollRef.instance.start();
      }
    }
  }

  // Desplazar al ancla desde el hash
  scrollToAnchorFromHash(delay = 0.3) {
    if (window.location.hash) {
      try {
        const scrollElement = document.querySelector(window.location.hash);

        if (scrollElement) {
          return this.scrollTo({
            target: scrollElement,
            delay,
          });
        }
      } catch (error) {

      }
    }
  }

  // Comprobar si el desplazamiento suave está habilitado
  isSmoothScrollingEnabled() {
    const scrollRef = app.componentsManager.getComponentByName('Scroll');

    return scrollRef && scrollRef.instance;
  }

  // Alternar clases en un elemento
  toggleClasses(element, classNamesString, force) {
    if (element && element instanceof HTMLElement) {
      const classNames = classNamesString.split(' ');

      if (classNames.length) {
        classNames.map(className => element.classList.toggle(className, force));
      }
    }
  }

  // Función de debounce para limitar la frecuencia de ejecución de una función
  debounce(func, wait, immediate) {
    let timeout;

    return function (...args) {
      let context = this;

      let later = () => {
        timeout = null;

        if (!immediate) {
          func.apply(context, args);
        };
      };

      let callNow = immediate && !timeout;

      clearTimeout(timeout);

      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args)
      };
    };
  }

  // Obtener el tiempo de debounce
  getDebounceTime(value = 400) {
    return value;
  }

  // Analizar una cadena de opciones en formato de objeto JSON
  parseOptionsStringObject(strObj) {
    let result = {};

    if (!strObj) {
      return result;
    }

    try {
      result = JSON.parse(this.convertStringToJSON(strObj));
    } catch (error) {
      console.warn(`${strObj} is not a valid parameters object`);
    }

    return result;
  }

  // Convertir una cadena de opciones en formato JSON
  convertStringToJSON(strObj) {
    if (!strObj) {
      return;
    }

    const filteredStr = strObj.replace(/'/g, '"');

    return filteredStr.replace(/(?=[^"]*(?:"[^"]*"[^"]*)*$)(\w+:)|(\w+ :)/g, function (s) {
      return '"' + s.substring(0, s.length - 1) + '":';
    });
  }

  // Bloquear/desbloquear la página
  pageLock(lock = true) {
    gsap.set('#page-blocking-curtain', {
      display: lock ? 'block' : 'none'
    });
  }

  // Obtener el objetivo del enlace
  getLinkTarget(event) {
    const target = event.target;

    if (target instanceof HTMLElement) {
      const link = target.closest('a') || target.closest('.virtual-link');

      if (link) {
        return link;
      }
    }

    return null;
  }

  // Convertir grados a radianes
  degrees2Radians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Obtener la altura del encabezado
  getHeaderHeight() {
    return parseInt(document.documentElement.style.getPropertyValue('--header-height'));
  }

  // Despachar un evento personalizado
  dispatchEvent(name, options, target = document) {
    const event = new CustomEvent(name, options);

    target.dispatchEvent(event);
  }

  // Esperar a que una variable global esté definida
  waitForVariable(variable, checkingInterval = 20, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const ticker = setInterval(() => {
        if (typeof window[variable] !== 'undefined') {
          clearInterval(ticker);
          resolve(window[variable]);
        }
      }, checkingInterval);

      setTimeout(() => {
        clearInterval(ticker);
        reject(`Global variable "window.${variable}" is still not defined after ${timeout}ms.`);
      }, timeout);
    });
  }

  // Comprobar si la opción está habilitada
  isEnabledOption(obj) {
    return obj === true || (typeof obj === 'object' && (!('enabled' in obj) || ('enabled' in obj && obj['enabled'] === true)));
  }

  // Obtener la escala de tiempo según la clave
  getTimeScaleByKey(key) {
    if (key in app.options.animations.speed && typeof app.options.animations.speed[key] === 'number') {
      if (app.options.animations.speed[key] === 0) {
        return 1;
      }

      return gsap.utils.clamp(0.01, Infinity, app.options.animations.speed[key]);
    }

    return 1;
  }

  // Obtener el valor de gancho de activación del disparador
  getTriggerHookValue(defaultValue = 0.15) {
    if ('triggerHook' in app.options.animations && typeof app.options.animations.triggerHook === 'number') {
      return gsap.utils.clamp(0.0, 1.0, app.options.animations.triggerHook);
    }

    return defaultValue;
  }

  // Determinar si se debe prevenir el clic en el enlace
  shouldPreventLinkClick(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  }
}

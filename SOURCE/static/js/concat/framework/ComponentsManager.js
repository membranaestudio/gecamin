class ComponentsManager {
  constructor() {
    // Inicializar el objeto para almacenar instancias de componentes
    this.instances = {
      persistent: [], // Instancias persistentes
      disposable: [], // Instancias desechables
    };
  }

  // Método para inicializar componentes
  init({
    scope = document, // Ámbito de búsqueda de componentes
    parent = null, // Elemento padre opcional
    loadInnerComponents = true, // Indicador de si se deben cargar los componentes internos
    storage = this.instances.disposable, // Almacenamiento de instancias
    selector = ':scope [data-arts-component-name]:not(:scope [data-arts-component-name] [data-arts-component-name])', // Selector para buscar componentes
    loadOnlyFirst = false, // Indicador de si se debe cargar solo el primer componente
    nameAttribute = 'data-arts-component-name', // Atributo para el nombre del componente
    optionsAttribute = 'data-arts-component-options', // Atributo para las opciones del componente
  }) {
    if (!scope) {
      return [];
    }

    let nodes = loadOnlyFirst ? [scope.querySelector(selector)] : [...scope.querySelectorAll(selector)]; // Obtener nodos que coinciden con el selector
    let promises = [];

    if (!parent) {
      nodes = nodes.filter(el => el && !el.matches(':scope [data-arts-component-name] [data-arts-component-name]')); // Filtrar nodos que son hijos de otros componentes

      if (!loadOnlyFirst) {
        nodes[0] = null;
      }
    }

    if (nodes && nodes.length) {
      nodes.forEach((el) => {
        const loader = this.loadComponent({
          el,
          parent,
          storage,
          loadInnerComponents,
          nameAttribute,
          optionsAttribute
        });

        promises.push(loader);
      });
    }

    return promises;
  }

  // Método para cargar un componente
  loadComponent({
    el,
    loadInnerComponents,
    parent,
    storage,
    name = undefined,
    nameAttribute = 'data-arts-component-name',
    optionsAttribute = 'data-arts-component-options',
    options = undefined,
  }) {
    if (!el) {
      return new Promise((resolve) => {
        resolve(true);
      });
    }

    const componentName = name || el.getAttribute(nameAttribute); // Obtener el nombre del componente
    const attrOptions = options || el.getAttribute(optionsAttribute); // Obtener las opciones del componente

    return new Promise((resolve, reject) => {
      if (typeof window[componentName] !== 'undefined') {
        // Instanciar el componente si está definido en el contexto global
        const instance = new window[componentName]({
          name: componentName,
          loadInnerComponents,
          parent,
          element: el,
          options: attrOptions
        });

        storage.push(instance); // Almacenar la instancia

        instance.ready.then(() => resolve(true));
      } else if (app.components[componentName]) {
        // Cargar el componente desde la lista de componentes de la aplicación
        this.load({
          properties: app.components[componentName],
        })
          .then((module) => {
            if (typeof module === 'object' && 'default' in module) {
              const instance = new module.default({
                name: componentName,
                loadInnerComponents,
                parent,
                element: el,
                options: attrOptions
              });

              storage.push(instance); // Almacenar la instancia

              instance.ready.then(() => resolve(true));
            } else {
              resolve(true);
            }
          });
      } else {
        console.error(`Component "${componentName}" is not recognized`);
        resolve(true);
      }
    });
  }

  // Método para cargar recursos necesarios para un componente
  load({
    properties = []
  }) {
    const depsPromises = []; // Promesas de dependencias
    const filesPromises = []; // Promesas de archivos

    return new Promise((resolve) => {
      if ('dependencies' in properties) {
        // Cargar dependencias
        properties.dependencies.forEach((dep) => {
          if (dep in app.assets) {
            app.assets[dep].forEach((resource) => {
              // depsPromises.push(import(resource));
              depsPromises.push(app.assetsManager.load(resource));
            });
          }
        });
      }

      if ('files' in properties) {
        // Cargar archivos
        properties.files.forEach((resource) => {
          filesPromises.push(app.assetsManager.load(resource));
        });
      }

      // Cargar dependencias y archivos de forma asincrónica
      Promise.all(depsPromises)
        .then(() => Promise.all(filesPromises))
        .then(() => typeof properties.file === 'string' ? import(properties.file) : {})
        .then(resolve);
    });
  }

  // Método para obtener una instancia de componente por nombre
  getComponentByName(name) {
    return this.instances.persistent.filter(instance => instance.name.toLowerCase() === name.toLowerCase())[0];
  }
}

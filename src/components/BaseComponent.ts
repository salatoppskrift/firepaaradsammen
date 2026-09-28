export abstract class BaseComponent extends HTMLElement {
    private _isRenderScheduled = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback(): void {
        this.scheduleRender();
    }

    attributeChangedCallback(): void {
        this.scheduleRender();
    }

    setProperty<T>(name: string, value: T): void {
        this.setAttribute(name, JSON.stringify(value));
    }

    getProperty<T>(name: string): T | undefined {
        const json = this.getAttribute(name);
        if (json === null) return undefined;
        return JSON.parse(json) as T;
    }

    dispatchCustomEvent<T>(eventName: string, detail: T): void {
        const event = new CustomEvent<T>(eventName, { detail, bubbles: true, composed: true });
        this.dispatchEvent(event);
    }

    protected scheduleRender(): void {
        if (this._isRenderScheduled) return;
        this._isRenderScheduled = true;
        // Samler synkrone property-endringer; nested komponenter rendres før neste paint.
        queueMicrotask(() => {
            this._isRenderScheduled = false;
            this.render();
        });
    }

    protected abstract render(): void;
}

const defaultConfig = {
    disableRipple: false,

    UiAutocomplete: {
        keys: {
            label: 'label',
            value: 'value',
            image: 'image',
        },
    },

    UiCheckboxGroup: {
        keys: {
            id: 'id',
            name: 'name',
            class: 'class',
            label: 'label',
            value: 'value',
            disabled: 'disabled',
        },
    },

    UiMenu: {
        keys: {
            icon: 'icon',
            type: 'type',
            label: 'label',
            secondaryText: 'secondaryText',
            iconProps: 'iconProps',
            disabled: 'disabled',
        },
    },

    UiRadioGroup: {
        keys: {
            id: 'id',
            class: 'class',
            label: 'label',
            value: 'value',
            checked: 'checked',
            disabled: 'disabled',
        },
    },

    UiSelect: {
        keys: {
            label: 'label',
            value: 'value',
            image: 'image',
        },
    },
};

export class KeenUiConfig {
    constructor() {
        this.data = Object.assign({}, defaultConfig, window.KeenUiConfig ? window.KeenUiConfig : {});
    }

    set(config = {}) {
        Object.assign(this.data, config);
    }
}

export default new KeenUiConfig();

const definition = {
  type: 'items',
  component: 'accordion',
  items: {
    appearance: {
      uses: 'settings',
      items: {
        placeholder: {
          ref: 'props.placeholder',
          label: 'Placeholder New',
          type: 'string',
          expression: 'optional',
        },
      },
    },
  },
};

export default definition;

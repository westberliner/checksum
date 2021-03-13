module.exports = {
    extends: [
        '@nextcloud'
    ],
    settings: {
        'import/resolver': {
            'node': {
                'extensions': ['.js', '.ts', 'vue']
            }
        }
    }
};

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    watch: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/i,
                use: [
                  'style-loader',
                  'css-loader',
                  'resolve-url-loader',
                  'sass-loader'
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    entry: {
        content: './src/content.ts',
        background: './src/background.ts',
        popup: './src/popup.ts',
        css: './src/css/css.ts'
    },
    output: {
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        }
    }
};

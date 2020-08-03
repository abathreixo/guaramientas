module.exports = {
    entry: './src/index.ts',
    mode: "production",
    devtool: 'inline-source-map',
    watch: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: "index.js",
    },
};

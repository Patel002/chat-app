import path from 'path';

export default {
  entry: './emoji-button-bundle.js',
  output: {
    filename: 'emoji-button.bundle.js', 
    path: path.resolve(__dirname,'public','js'),  
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  mode: 'production',
};

pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("my-react-app:${env.BUILD_ID}")
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    docker.image("my-react-app:${env.BUILD_ID}").inside {
                        sh 'npm test'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    docker.image("my-react-app:${env.BUILD_ID}").run('-p 3001:3001 --name my-react-app-container')
                }
            }
        }
    }
    
    post {
        failure {
            sh 'docker rm -f my-react-app-container || true'
        }
    }
}

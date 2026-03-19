import { spawn } from 'node:child_process'

function run(name, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code
    }
  })

  return child
}

const processes = [
  run('server', process.platform === 'win32' ? 'python' : 'python3', ['server/app.py']),
  run('client', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:client']),
]

function shutdown(signal) {
  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

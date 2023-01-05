const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user)
    return response.status(400).json({error: "User not found"});

  request.user = user;

  return next();
}

function checkExistsTodoUser(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;
  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo)
    return response.status(400).json({error: "Todo not found"});
    
  request.user = user;
    
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodoUser, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(user);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodoUser, (request, response) => {
  const { id } = request.query;
  const { user } = request;
  const todo = user.todos.find(todo => todo.id === id);

  if(todo.done)
    return response.status(404).json({error: "Todo already done"});

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodoUser, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  user.todos.splice(todo, 1);

  return response.status(204).json(users);
});

module.exports = app;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  useEffect(() => {
    axios.get('/api/tasks').then((res) => setTasks(res.data));
  }, []);

  const addTask = async () => {
    if (!newTask) return;
    const res = await axios.post<Task>('/api/tasks', { title: newTask });
    setTasks([...tasks, res.data]);
    setNewTask('');
  };

  const toggleTask = async (task: Task) => {
    const res = await axios.put<Task>(`/api/task/${task._id}`, { completed: !task.completed });
    setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/task/${id}`);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Task Manager</Typography>
      <TextField
        fullWidth
        label="New Task"
        variant="outlined"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={addTask}>Add Task</Button>
      <List>
        {tasks.map((task) => (
          <ListItem key={task._id} secondaryAction={
            <IconButton edge="end" onClick={() => deleteTask(task._id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <Checkbox checked={task.completed} onChange={() => toggleTask(task)} />
            <ListItemText primary={task.title} sx={{ textDecoration: task.completed ? 'line-through' : 'none' }} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

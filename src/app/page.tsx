"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [loadingState, setLoadingState] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");

  const showSnackBar = (msg: string) => {
    setSnackBarMsg(msg);
    setOpenSnackBar(true);
  };

  const hideSnackBar = () => {
    setSnackBarMsg("");
    setOpenSnackBar(false);
  };

  useEffect(() => {
    axios.get("/api/tasks").then((res) => setTasks(res.data));
  }, []);

  const addTask = async () => {
    if (!newTask) return;
    setLoadingState(true);
    const form = { title: newTask };
    // console.log('addtask:', form)
    const res = await axios.post<Task>("/api/tasks", form);
    setTasks([...tasks, res.data]);
    setNewTask("");
    showSnackBar("Task added!");
    setLoadingState(false);
  };

  const toggleTask = async (task: Task) => {
    const res = await axios.put<Task>(`/api/task?id=${task._id}`, {
      completed: !task.completed,
    });
    setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    showSnackBar("Task done!");
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/task?id=${id}`);
    const list = tasks.filter((t) => t._id !== id);
    // console.log('after.deletion:', list)
    showSnackBar("Task deleted!");
    setTasks(list);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    hideSnackBar();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 5 }}>
        <Typography variant="h5" gutterBottom>
          Task Manager
        </Typography>
        <TextField
          fullWidth
          label="New Task"
          variant="standard"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={addTask} loading={loadingState}>
          Add Task
        </Button>
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task._id}
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteTask(task._id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Checkbox
                checked={task.completed}
                onChange={() => toggleTask(task)}
              />
              <ListItemText
                primary={task.title}
                sx={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleClose}
        message={snackBarMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        // action={action}
      />
    </Container>
  );
}

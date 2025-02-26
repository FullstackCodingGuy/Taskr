"use client";
import { useSession, signIn, signOut } from "next-auth/react";
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
  CircularProgress,
  DialogContent,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";
import Badge from "@mui/material/Badge";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { format } from "date-fns";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
}

export interface SimpleDialogProps {
  open: boolean;
  selectedValue?: Task;
  onClose: (value: string) => void;
}

function AddTaskDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;

  const newTaskProp = {
    title: "",
    dueDate: new Date().toISOString().slice(0, 10),
    priority: "Medium",
  };
  const [loadingState, setLoadingState] = useState(false);
  const [newTask, setNewTask] = useState(newTaskProp);

  const handleClose = () => {
    onClose("");
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.dueDate) {
      console.error("Validation error");
      return;
    }
    setLoadingState(true);
    await axios.post<Task>("/api/tasks", newTask);
    setNewTask(newTaskProp);
    setLoadingState(false);
    onClose("Task added!");
  };
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Task</DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          fullWidth
          label="New Task"
          variant="standard"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          // sx={{ mb: 2 }}
        />

        <Grid container spacing={2} mb={2}>
          <Grid size={6}>
            <TextField
              fullWidth
              type="date"
              size="small"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              sx={{ mt: 2 }}
            />
          </Grid>
          <Grid size={6}>
            <Select
              fullWidth
              size="small"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as "Low" | "Medium" | "High",
                })
              }
              sx={{ mt: 2 }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Button variant="contained" onClick={addTask} loading={loadingState}>
          Add Task
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function TaskHeader(props) {
  const [open, setOpen] = useState(false);
  const [selectedValue] = useState();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    props.onClose(value);
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="h5" gutterBottom>
        Tasks
        <Badge
          badgeContent={props?.tasks?.length}
          color="info"
          sx={{ ml: 2 }}
        ></Badge>
      </Typography>
      <Button variant="contained" onClick={handleClickOpen}>
        Add Task
      </Button>
      <AddTaskDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </Stack>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const loadList = () => {
    axios.get("/api/tasks").then((res) => {
      setTasks(res.data);
      setInitialLoading(false);
    });
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadList();
    }
  }, [status]);

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

  const onDialogClose = (msg: string) => {
    showSnackBar(msg);
    loadList();
  };

  if (status === "loading") {
    return <CircularProgress />;
  }

  if (status === "unauthenticated") {
    return (
      <Container maxWidth="md" sx={{ mt: 1 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to manage your tasks.
        </Typography>
        <Button variant="contained" onClick={() => signIn()}>
          Sign In
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 1 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <TaskHeader {...{ tasks, onClose: onDialogClose }} />

        {initialLoading ? (
          <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ mt: 1, mx: -3 }}>
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
                  primary={`${task.title} (Due: ${format(
                    new Date(task.dueDate),
                    "dd MMM"
                  )})`}
                  secondary={`Priority: ${task.priority}`}
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleClose}
        message={snackBarMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Container>
  );
}
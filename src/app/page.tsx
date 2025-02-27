"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  CircularProgress,
  DialogContent,
  Stack,
  Avatar,
  Button,
  AppBar,
  Link,
  Menu,
  Toolbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Badge from "@mui/material/Badge";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { format } from "date-fns";
interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: "Low" | "Medium" | "High";
}

export interface SimpleDialogProps {
  open: boolean;
  selectedValue?: Task;
  onClose: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

function AddTaskDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;

  const newTaskProp = {
    title: "",
    dueDate: new Date().toISOString().slice(0, 10),
    priority: "Medium",
    userId: props.user.id,
  };
  const [loadingState, setLoadingState] = useState(false);
  const [newTask, setNewTask] = useState(newTaskProp);

  const handleClose = () => {
    onClose("");
  };

  const addTask = async () => {
    if (!newTask.title) {
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
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    props.onClose(value);
  };

  const menuopen = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container>
      <AppBar position="absolute" color="transparent">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tasks
            <Badge
              badgeContent={props?.tasks?.length}
              color="info"
              sx={{ ml: 2 }}
            ></Badge>
          </Typography>
          <div className="hidden md:flex space-x-4">
            <Button
              variant="text"
              color="warning"
              size="small"
              onClick={handleClickOpen}
            >
              Add Task
            </Button>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
              // sx={{ display: { lg: "none" } }}
            >
              <Avatar alt={props.user.name} src={props.user.image} />
            </IconButton>
          </div>
          <Menu anchorEl={anchorEl} open={menuopen} onClose={handleMenuClose}>
            <MenuItem onClick={() => signOut()} component={Link}>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <AddTaskDialog
          selectedValue={selectedValue}
          open={open}
          onClose={handleClose}
          user={props.user}
        />
      </Stack>
    </Container>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");

  const showSnackBar = (msg: string) => {
    if (!msg) return;
    setSnackBarMsg(msg);
    setOpenSnackBar(true);
  };

  const hideSnackBar = () => {
    setSnackBarMsg("");
    setOpenSnackBar(false);
  };

  const loadList = useCallback(() => {
    console.log("page>>session: ", status, session);
    if (!session || !session.user || !session.user["id"]) return;
    axios.get(`/api/tasks?uid=${session?.user["id"]}`).then((res) => {
      setTasks(res.data);
      setInitialLoading(false);
    });
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      loadList();
    }
  }, [status, loadList]);

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
      <Container sx={{ textAlign: "center" }}>
        <div className="bg-gray-50 text-gray-900 font-sans">
          <header className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center px-6">
            <h1 className="text-5xl font-bold mb-4">Taskr</h1>
            <p className="text-lg mb-6">Minimalistic personal task manager.</p>
            <a
              href="#"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition"
            >
              <Button onClick={() => signIn()}>Get Started</Button>
            </a>
          </header>

          <footer className="text-center py-6 text-gray-600">
            <p>&copy; 2025 Taskr. All rights reserved.</p>
          </footer>
        </div>
      </Container>
    );
  }

  return (
    <Stack direction="column">
      <TaskHeader {...{ tasks, user: session?.user, onClose: onDialogClose }} />

      <Container sx={{ mt: 10 }}>
        {initialLoading ? (
          <CircularProgress />
        ) : (
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
                  primary={`${task.title} ${
                    task.dueDate
                      ? `(Due: ${format(new Date(task.dueDate), "dd MMM")})`
                      : ""
                  }`}
                  secondary={`Priority: ${task.priority}`}
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Container>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleClose}
        message={snackBarMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Stack>
  );
}

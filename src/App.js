import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Edit, Delete } from "@mui/icons-material";

// PriorityQueue Class
class PriorityQueue {
  constructor() {
    this.tasks = [];
  }

  enqueue(task) {
    this.tasks.push(task);
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.tasks.length - 1;
    const task = this.tasks[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parentTask = this.tasks[parentIndex];

      if (
        this.getPriority(task.priority) < this.getPriority(parentTask.priority)
      ) {
        this.tasks[index] = parentTask;
        index = parentIndex;
      } else {
        break;
      }
    }

    this.tasks[index] = task;
  }

  dequeue() {
    const task = this.tasks[0];
    const end = this.tasks.pop();
    if (this.tasks.length > 0) {
      this.tasks[0] = end;
      this.sinkDown();
    }
    return task;
  }

  sinkDown() {
    let index = 0;
    const length = this.tasks.length;
    const task = this.tasks[0];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.tasks[leftChildIndex];
        if (
          this.getPriority(leftChild.priority) < this.getPriority(task.priority)
        ) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.tasks[rightChildIndex];
        if (
          (swap === null &&
            this.getPriority(rightChild.priority) <
              this.getPriority(task.priority)) ||
          (swap !== null &&
            this.getPriority(rightChild.priority) <
              this.getPriority(leftChild.priority))
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;
      this.tasks[index] = this.tasks[swap];
      index = swap;
    }

    this.tasks[index] = task;
  }

  isEmpty() {
    return this.tasks.length === 0;
  }

  getPriority(priority) {
    if (priority === "High") return 1;
    if (priority === "Medium") return 2;
    if (priority === "Low") return 3;
    return 4; // Default case for unknown priorities
  }
}

// Binary Search Tree Classes
class TreeNode {
  constructor(task) {
    this.task = task;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(task) {
    const newNode = new TreeNode(task);
    if (!this.root) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    if (newNode.task.title < node.task.title) {
      if (!node.left) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (!node.right) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  search(title) {
    return this.searchNode(this.root, title);
  }

  searchNode(node, title) {
    if (!node) return null;
    if (title === node.task.title) return node.task;
    return title < node.task.title
      ? this.searchNode(node.left, title)
      : this.searchNode(node.right, title);
  }

  getAllTasks(node = this.root, result = []) {
    if (node) {
      this.getAllTasks(node.left, result);
      result.push(node.task);
      this.getAllTasks(node.right, result);
    }
    return result;
  }

  delete(title) {
    this.root = this.deleteNode(this.root, title);
  }

  deleteNode(node, title) {
    if (!node) return null;

    if (title < node.task.title) {
      node.left = this.deleteNode(node.left, title);
    } else if (title > node.task.title) {
      node.right = this.deleteNode(node.right, title);
    } else {
      // Node with only one child or no child
      if (!node.left) return node.right;
      else if (!node.right) return node.left;

      // Node with two children: Get the inorder successor (smallest in the right subtree)
      const minLargerNode = this.findMin(node.right);
      node.task = minLargerNode.task; // Copy the inorder successor's content to this node
      node.right = this.deleteNode(node.right, minLargerNode.task.title); // Delete the inorder successor
    }

    return node;
  }

  findMin(node) {
    while (node.left) {
      node = node.left;
    }
    return node;
  }
}

function App() {
  const [tasks, setTasks] = useState(new PriorityQueue());
  const [taskTree, setTaskTree] = useState(new BinarySearchTree());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    dueDate: null,
    priority: "Medium",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddTask = () => {
    const newTask = { ...taskDetails, id: Date.now(), status: "In Progress" };
    tasks.enqueue(newTask);
    taskTree.insert(newTask);
    handleCloseModal();
  };

  const handleEditTask = () => {
    const updatedTask = { ...editingTask, ...taskDetails };
    tasks.dequeue(); // Remove the old task
    tasks.enqueue(updatedTask); // Enqueue the updated task
    const existingTask = taskTree.search(editingTask.title);
    if (existingTask) {
      taskTree.delete(existingTask.title); // Remove old task from BST before inserting updated task
      taskTree.insert(updatedTask);
    }
    handleCloseModal();
  };

  const handleDeleteTask = (id) => {
    // Find the task to delete
    const taskToDelete = tasks.tasks.find((task) => task.id === id);
    if (taskToDelete) {
      // Remove from the priority queue
      const remainingTasks = [];

      while (!tasks.isEmpty()) {
        const task = tasks.dequeue();
        if (task.id !== id) {
          remainingTasks.push(task); // Keep tasks that are not being deleted
        }
      }

      // Re-add remaining tasks to the priority queue
      remainingTasks.forEach((task) => tasks.enqueue(task));

      // Remove from the binary search tree
      taskTree.delete(taskToDelete.title);

      // Update the state to trigger a re-render
      setTasks(tasks);
      setTaskTree(taskTree);
    }
  };

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setTaskDetails(
      task || { title: "", description: "", dueDate: null, priority: "Medium" }
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Task Management</Typography>
          <Button color="inherit" onClick={() => handleOpenModal()}>
            Add Task
          </Button>
        </Toolbar>
      </AppBar>
      <TextField
        label="Search Tasks"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <List>
        {filteredTasks.map((task) => (
          <ListItem key={task.id}>
            <ListItemText primary={task.title} secondary={task.description} />
            <IconButton edge="end" onClick={() => handleOpenModal(task)}>
              <Edit />
            </IconButton>
            <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <div
          style={{
            padding: 20,
            background: "white",
            margin: "auto",
            marginTop: "10%",
            width: "400px",
          }}
        >
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={taskDetails.title}
            margin="normal"
            onChange={(e) =>
              setTaskDetails({ ...taskDetails, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            margin="normal"
            rows={4}
            value={taskDetails.description}
            onChange={(e) =>
              setTaskDetails({ ...taskDetails, description: e.target.value })
            }
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={taskDetails.dueDate}
              onChange={(newValue) =>
                setTaskDetails({ ...taskDetails, dueDate: newValue })
              }
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <TextField
            label="Priority"
            select
            fullWidth
            value={taskDetails.priority}
            onChange={(e) =>
              setTaskDetails({ ...taskDetails, priority: e.target.value })
            }
            margin="normal"
            required
          >
            {["High", "Medium", "Low"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={editingTask ? handleEditTask : handleAddTask}
          >
            {editingTask ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </Modal>
    </Container>
  );
}

export default App;

import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import PriorityQueue from "./utils/PriorityQueue";
import BinarySearchTree from "./utils/BinarySearchTree";
import AddEditTaskModal from "./components/AddEditTaskModal";
import TaskList from "./components/TaskList";
import SearchBar from "./components/SearchBar";

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
    status: "Not Started", // default status
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddTask = () => {
    const newTask = { ...taskDetails, id: Date.now() };
    tasks.enqueue(newTask);
    taskTree.insert(newTask);
    handleCloseModal();
  };

  const handleEditTask = () => {
    const updatedTask = { ...editingTask, ...taskDetails };
    tasks.update(editingTask.id, updatedTask); // Assuming PriorityQueue has an update method
    taskTree.update(editingTask.title, updatedTask); // Assuming BST has an update method
    handleCloseModal();
  };

  const handleDeleteTask = (id) => {
    const taskToDelete = tasks.tasks.find((task) => task.id === id);
    if (taskToDelete) {
      tasks.remove(id); // Remove task from queue (assuming PriorityQueue has a remove method)
      taskTree.delete(taskToDelete.title); // Remove task from BST
      setTasks(tasks);
      setTaskTree(taskTree);
    }
  };

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setTaskDetails(
      task || {
        title: "",
        description: "",
        dueDate: null,
        priority: "Medium",
        status: "Not Started",
      }
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

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
      <SearchBar setSearchQuery={setSearchQuery} />
      <TaskList
        tasks={filteredTasks}
        handleEdit={handleOpenModal}
        handleDelete={handleDeleteTask}
      />
      <AddEditTaskModal
        open={modalOpen}
        taskDetails={taskDetails}
        setTaskDetails={setTaskDetails}
        handleClose={handleCloseModal}
        handleSubmit={editingTask ? handleEditTask : handleAddTask}
        editingTask={editingTask}
      />
    </Container>
  );
}

export default App;

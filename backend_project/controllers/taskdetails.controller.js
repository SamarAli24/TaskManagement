import TaskDetails from "../models/taskdetails.js";
import { Sequelize } from 'sequelize'; 
import Task from "../models/task.js";

export const createTaskDetails = async (req, res) => {
    try {
      const { day, description, taskId , addition_date } = req.body;
  
      
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
      // Find the last addition_no for the given taskId
      const lastTaskDetail = await TaskDetails.findOne({
        where: { taskId },
        order: [['addition_no', 'DESC']],
      });
  
      let addition_no = 1; 
  
      // If there is a previous entry, increment addition_no by 1
      if (lastTaskDetail) {
        addition_no = lastTaskDetail.addition_no + 1;
      }
  
      // Create the new TaskDetails entry with the incremented addition_no
      const newTaskDetails = await TaskDetails.create({
        addition_no,
        day,
        description,
        taskId,
        addition_date,  
      });
  
      return res.status(201).json({
        message: 'TaskDetails created successfully',
        data: newTaskDetails,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Server Error',
        error: error.message,
      });
    }
  };



  export const getDetailsByTaskId = async (req, res)  => {
    try {
        const { id } = req.params;
  
      console.log(req.params)
       

      // Validate input data
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
    //   const taskDetails = await TaskDetails.findAll({
    //     where: { taskId: id },
    //   });

    const task = await Task.findOne({
        where: { id : id },
      });

    const taskDetails = await TaskDetails.findAll({
        where: { taskId: id },
        attributes: {
          include: [
            [
              Sequelize.literal(
                `DATE_PART('day', CURRENT_DATE::date - DATE_TRUNC('day', "TaskDetails"."created_date"::date))`
              ),
              'days_since_creation', // This will return the number of days from creation date
            ],
          ],
        }, order: [['id', 'ASC']], 
      });
  
  
      // If no TaskDetails found for the given taskId
      if (!taskDetails.length) {
        return res.status(404).json({ message: 'No TaskDetails found for this Task ID' });
      }
  
      // Return the TaskDetails data
      return res.status(200).json({
        message: 'Task and TaskDetails retrieved successfully',
        task, // Return the task data
        taskDetails, // Return the task details associated with the task
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Server Error',
        error: error.message,
      });
    }
  };
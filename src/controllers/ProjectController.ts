import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    project.manager = req.user.id;

    try {
      await project.save();
      res.send("Proyecto Creado Correctamente!");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user.id } },
          { team: { $in: req.user.id } },
        ],
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };
  static getProjectById = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate({
          path: "tasks",
          populate: {
            path: "assignedTo",
            select: "_id name",
          },
        })
        .populate({
          path: "team",
          select: "_id name",
        });
      console.log(req.user.id);
      console.log(project.team);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (
        !project.manager.includes(req.user.id.toString()) &&
        !project.team.some(
          (member) => member._id.toString() === req.user.id.toString()
        )
      ) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ error: error.message });
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };
  static updateProjectById = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Solo el manager puede actualizar el proyecto");
        return res.status(404).json({ error: error.message });
      }
      project.projectName = req.body.projectName;
      project.clientName = req.body.clientName;
      project.description = req.body.description;
      await project.save();
      res.json("Proyecto Actualizado!");
    } catch (error) {
      console.log(error);
    }
  };
  static deleteProject = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Solo el manager puede eliminar el proyecto");
        return res.status(404).json({ error: error.message });
      }
      await project.deleteOne();
      res.json("Proyecto Eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}

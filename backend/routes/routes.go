package routes

import (
	"file-sharing-app/config"
	"file-sharing-app/handlers"
	"file-sharing-app/services"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	cfg := config.LoadConfig()
	fileService := services.NewFileService(cfg.UploadDir)
	fileHandler := handlers.NewFileHandler(fileService, cfg)

	api := app.Group("/api")

	// File routes
	files := api.Group("/files")
	files.Post("/upload", fileHandler.UploadFile)
	files.Get("/", fileHandler.GetFiles)
	files.Get("/:filename/download", fileHandler.DownloadFile)
	files.Delete("/:filename", fileHandler.DeleteFile)

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "File sharing API is running",
		})
	})
}

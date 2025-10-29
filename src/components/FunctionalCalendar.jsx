import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon
} from '@mui/icons-material';
import 'react-calendar/dist/Calendar.css';
import './FunctionalCalendar.css';

const FunctionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventText, setEventText] = useState('');
  const [eventType, setEventType] = useState('task'); // 'task' o 'message'
  const [viewMode, setViewMode] = useState('month'); // 'month' o 'week'

  // Cargar eventos del localStorage al iniciar
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Guardar eventos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setEventText('');
    setEventType('task');
    setOpenDialog(true);
  };

  const handleAddEvent = () => {
    if (eventText.trim()) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const newEvent = {
        id: editingEvent ? editingEvent.id : Date.now(),
        text: eventText.trim(),
        type: eventType,
        date: dateKey,
        createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
      };

      setEvents(prev => ({
        ...prev,
        [dateKey]: prev[dateKey] ? [...prev[dateKey], newEvent] : [newEvent]
      }));

      setOpenDialog(false);
      setEventText('');
      setEditingEvent(null);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventText(event.text);
    setEventType(event.type);
    setOpenDialog(true);
  };

  const handleDeleteEvent = (eventToDelete) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(event => event.id !== eventToDelete.id)
    }));
  };

  const handleDeleteAllEvents = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setEvents(prev => {
      const newEvents = { ...prev };
      delete newEvents[dateKey];
      return newEvents;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = events[dateKey];
      
      if (dayEvents && dayEvents.length > 0) {
        return 'calendar-has-events';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = events[dateKey];
      
      if (dayEvents && dayEvents.length > 0) {
        return (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 2, 
            right: 2,
            display: 'flex',
            gap: 0.5
          }}>
            {dayEvents.slice(0, 2).map((event, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: event.type === 'task' ? '#3b82f6' : '#f59e0b',
                  opacity: 0.8
                }}
              />
            ))}
            {dayEvents.length > 2 && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '8px',
                  color: '#1e293b',
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}
              >
                +{dayEvents.length - 2}
              </Typography>
            )}
          </Box>
        );
      }
    }
    return null;
  };

  const getEventsForSelectedDate = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    return events[dateKey] || [];
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Calendario
        </Typography>
        <Tooltip title="Agregar evento">
          <IconButton 
            onClick={() => handleDateClick(selectedDate)}
            sx={{ 
              color: '#3b82f6',
              '&:hover': { bgcolor: '#eff6ff' }
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100% - 60px)' }}>
        {/* Calendario */}
        <Box sx={{ flex: 1 }}>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            locale="es-CL"
            tileClassName={tileClassName}
            tileContent={tileContent}
            onClickDay={handleDateClick}
            prevLabel="<"
            nextLabel=">"
            prev2Label="«"
            next2Label="»"
            className="functional-calendar"
            sx={{
              '& .react-calendar__tile': {
                position: 'relative',
                height: '60px !important',
                fontSize: '14px'
              },
              '& .calendar-has-events': {
                backgroundColor: '#f0f9ff !important',
                border: '2px solid #3b82f6 !important'
              }
            }}
          />
        </Box>

        {/* Panel de eventos */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#f8fafc', 
          borderRadius: 2, 
          p: 2,
          border: '1px solid #e2e8f0'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1e293b', fontWeight: 600 }}>
            Eventos del {selectedDate.toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
                              startIcon={<Add />}
              onClick={() => handleDateClick(selectedDate)}
              sx={{ 
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                mb: 1
              }}
              fullWidth
            >
              Agregar Evento
            </Button>
          </Box>

          <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {getEventsForSelectedDate().length === 0 ? (
              <Typography variant="body2" sx={{ 
                color: '#1e293b', 
                textAlign: 'center', 
                py: 4,
                fontWeight: 600,
                fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }}>
                No hay eventos para esta fecha
              </Typography>
            ) : (
              getEventsForSelectedDate().map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    mb: 1,
                    bgcolor: '#fff',
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <EventIcon 
                      sx={{ 
                        color: event.type === 'task' ? '#3b82f6' : '#f59e0b',
                        fontSize: 16
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {event.text}
                    </Typography>
                    <Chip
                      label={event.type === 'task' ? 'Tarea' : 'Mensaje'}
                      size="small"
                      sx={{
                        bgcolor: event.type === 'task' ? '#dbeafe' : '#fef3c7',
                        color: event.type === 'task' ? '#1e40af' : '#92400e',
                        fontSize: '10px'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEditEvent(event)}
                        sx={{ 
                          color: '#1e293b',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'optimizeLegibility'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEvent(event)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {getEventsForSelectedDate().length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleDeleteAllEvents}
              sx={{ mt: 2 }}
              fullWidth
            >
              Eliminar Todos
            </Button>
          )}
        </Box>
      </Box>

      {/* Dialog para agregar/editar eventos */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Editar Evento' : 'Agregar Evento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ 
              mb: 1, 
              color: '#1e293b',
              fontWeight: 600,
              fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>
              Fecha: {selectedDate.toLocaleDateString('es-CL')}
            </Typography>
            
            <TextField
              fullWidth
              label="Descripción del evento"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={eventType === 'task' ? 'contained' : 'outlined'}
                onClick={() => setEventType('task')}
                sx={{ flex: 1 }}
              >
                Tarea
              </Button>
              <Button
                variant={eventType === 'message' ? 'contained' : 'outlined'}
                onClick={() => setEventType('message')}
                sx={{ flex: 1 }}
              >
                Mensaje
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddEvent}
            variant="contained"
            disabled={!eventText.trim()}
          >
            {editingEvent ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FunctionalCalendar; 
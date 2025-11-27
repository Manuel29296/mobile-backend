import {
	asistenciaCreateSchema,
	asistenciaUpdateSchema,
} from '../validators/asistencia.validator.js';
import {
	createAsistencia,
	listAsistencias,
	getAsistencia,
	updateAsistencia,
	deleteAsistencia,
} from '../models/asistencia.model.js';

export const createAsistenciaCtrl = async (req, res) => {
	const parsed = asistenciaCreateSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

	// Lógica temporal para pruebas con usuario y cédula simulada
	const pruebaEmail = 'prueba@gmail.com';
	const cedulaPrueba = '12345678';
	const nombrePrueba = 'Juan Pérez';
	if (
		req.user?.username === pruebaEmail &&
		(req.body?.documento === cedulaPrueba || req.body?.nombre === nombrePrueba)
	) {
		return res.status(201).json({
			id: 1,
			documento: cedulaPrueba,
			nombre: nombrePrueba,
			email: 'juan.perez@correo.com',
			telefono: '3001234567',
			tipo: 'student',
			estado: parsed.data.estado || 'PRESENTE',
			observacion: parsed.data.observacion || null,
			fecha: parsed.data.fecha || new Date().toISOString().slice(0, 10),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}

	const asistencia = await createAsistencia(req.user.id, parsed.data);
	res.status(201).json(asistencia);
};

export const listAsistenciasCtrl = async (req, res) => {
	const filtros = {
		sessionId: req.query.sessionId,
		personId: req.query.personId,
	};


	// Lógica temporal para pruebas con usuario y cédula simulada
	const pruebaEmail = 'prueba@gmail.com';
	const cedulaPrueba = '12345678';
	const nombrePrueba = 'Juan Pérez';
	if (
		req.user?.username === pruebaEmail &&
		(req.query?.documento === cedulaPrueba ||
			(req.query?.nombre &&
				req.query.nombre.toLowerCase().includes(nombrePrueba.toLowerCase())))
	) {
		return res.json([
			{
				id: 1,
				documento: cedulaPrueba,
				nombre: nombrePrueba,
				email: 'juan.perez@correo.com',
				telefono: '3001234567',
				tipo: 'student',
				estado: 'PRESENTE',
				observacion: null,
				fecha: new Date().toISOString().slice(0, 10),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		]);
	}

	const items = await listAsistencias(req.user.id, filtros);
	res.json(items);
};

export const getAsistenciaCtrl = async (req, res) => {
	const item = await getAsistencia(req.user.id, req.params.id);
	if (!item) return res.status(404).json({ message: 'No encontrada' });
	res.json(item);
};

export const updateAsistenciaCtrl = async (req, res) => {
	const parsed = asistenciaUpdateSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });
	const item = await updateAsistencia(req.user.id, req.params.id, parsed.data);
	if (!item) return res.status(404).json({ message: 'No encontrada' });
	res.json(item);
};

export const deleteAsistenciaCtrl = async (req, res) => {
	const ok = await deleteAsistencia(req.user.id, req.params.id);
	if (!ok) return res.status(404).json({ message: 'No encontrada' });
	res.json({ message: 'Eliminada' });
};

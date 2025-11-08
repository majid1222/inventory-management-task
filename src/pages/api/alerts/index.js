import { generateAlerts, updateAlertStatus } from '../../../../lib/data';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const alerts = await generateAlerts();
      res.status(200).json(alerts);
      return;
    }
    if (req.method === 'POST') {
      const { id, workflowStatus, comment } = req.body || {};
      if (!id || !workflowStatus) {
        res.status(400).json({ error: 'id and workflowStatus are required' });
        return;
      }
      const alert = await updateAlertStatus(id, workflowStatus, comment);
      res.status(200).json(alert);
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Alerts error' });
  }
}
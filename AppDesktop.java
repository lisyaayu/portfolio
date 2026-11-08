import javax.swing.*;
import javax.swing.plaf.basic.BasicScrollBarUI;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;
import java.io.File;
import java.net.URI;

/**
 * Portfolio Desktop — Lisya | UMC
 * Versi desktop (Java Swing) dari portfolio web.
 *
 * Cara menjalankan:
 *   javac -encoding UTF-8 AppDesktop.java
 *   java AppDesktop
 *
 * Tombol "Buka Portfolio Web" akan membuka index.html yang ada di folder yang sama
 * (tidak perlu XAMPP). Jika file tidak ditemukan, baru dicoba http://localhost/portfolio-pbp/.
 */
public class AppDesktop extends JFrame {

    // ===== Warna tema (selaras dengan portfolio web) =====
    private static final Color PRIMARY      = new Color(99, 102, 241);
    private static final Color PRIMARY_DARK = new Color(79, 70, 229);
    private static final Color BG_DARK      = new Color(11, 15, 26);
    private static final Color CARD_BG      = new Color(17, 24, 39);
    private static final Color SURFACE      = new Color(30, 41, 59);
    private static final Color TEXT_BRIGHT  = new Color(248, 250, 252);
    private static final Color TEXT_MUTED   = new Color(148, 163, 184);
    private static final Color ACCENT       = new Color(6, 182, 212);

    // ===== DATA PROFIL — ubah di sini saja =====
    private static final String NAMA  = "Lisya Ayu Mutiara Ramadhani";
    private static final String NIM   = "[isi NIM]";     // ← ganti dengan NIM kamu
    private static final String KELAS = "[isi Kelas]";   // ← ganti dengan kelas kamu
    private static final String EMAIL = "lisyaayu466@gmail.com";
    private static final String GITHUB = "github.com/lisyaayu";

    private static final String WEB_ONLINE_URL   = "https://lisyaayu.github.io/portfolio-pbp/";
    private static final String WEB_FALLBACK_URL = "http://localhost/portfolio-pbp/";

    // Font: pakai yang tersedia di OS (Segoe UI hanya ada di Windows)
    private static final String FONT_FAMILY = pickFontFamily("Segoe UI", "Inter", "Helvetica Neue", "Arial");

    private static String pickFontFamily(String... candidates) {
        String[] available = GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames();
        for (String want : candidates) {
            for (String have : available) {
                if (have.equalsIgnoreCase(want)) return have;
            }
        }
        return Font.SANS_SERIF;
    }

    private static Font font(int style, int size) {
        return new Font(FONT_FAMILY, style, size);
    }

    // ============================================================
    //  KOMPONEN KUSTOM
    //  (Digambar sendiri agar warna tidak diabaikan oleh Look & Feel
    //   sistem, mis. tombol Windows yang selalu abu-abu.)
    // ============================================================

    /** Panel isi yang mengikuti lebar viewport (tidak ada scroll horizontal). */
    private static class ScrollPanel extends JPanel implements Scrollable {
        ScrollPanel() { setBackground(BG_DARK); }
        public Dimension getPreferredScrollableViewportSize() { return getPreferredSize(); }
        public int getScrollableUnitIncrement(Rectangle r, int o, int d) { return 16; }
        public int getScrollableBlockIncrement(Rectangle r, int o, int d) { return Math.max(r.height - 40, 16); }
        public boolean getScrollableTracksViewportWidth() { return true; }
        public boolean getScrollableTracksViewportHeight() { return false; }
    }

    /** Kartu: tingginya tidak melar mengikuti ruang kosong. */
    private static class Card extends JPanel {
        Card(String title) {
            setBackground(CARD_BG);
            setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
            setAlignmentX(LEFT_ALIGNMENT);
            setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(SURFACE, 1),
                BorderFactory.createEmptyBorder(16, 18, 16, 18)));

            JLabel titleLabel = new JLabel(title);
            titleLabel.setFont(font(Font.BOLD, 15));
            titleLabel.setForeground(TEXT_BRIGHT);
            titleLabel.setAlignmentX(LEFT_ALIGNMENT);
            add(titleLabel);
        }

        @Override public Dimension getMaximumSize() {
            return new Dimension(Integer.MAX_VALUE, getPreferredSize().height);
        }
    }

    /** Header dengan latar gradasi. */
    private static class GradientHeader extends JPanel {
        @Override protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setPaint(new GradientPaint(0, 0, PRIMARY, getWidth(), getHeight(), ACCENT));
            g2.fillRect(0, 0, getWidth(), getHeight());
            g2.dispose();
        }
    }

    /** Bar keahlian bergradasi dengan animasi saat aplikasi dibuka. */
    private static class SkillBar extends JComponent {
        private final int target;
        private float shown = 0f;   // 0..target

        SkillBar(int target) {
            this.target = target;
            setPreferredSize(new Dimension(200, 18));
            setMinimumSize(new Dimension(60, 18));
            setOpaque(false);

            Timer timer = new Timer(15, null);
            timer.addActionListener(e -> {
                shown += Math.max(1f, target / 40f);
                if (shown >= target) { shown = target; timer.stop(); }
                repaint();
            });
            timer.setInitialDelay(250);
            timer.start();
        }

        @Override protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            int w = getWidth(), h = getHeight();
            g2.setColor(SURFACE);
            g2.fill(new RoundRectangle2D.Float(0, 0, w, h, h, h));

            int fillW = Math.round(w * shown / 100f);
            if (fillW > 0) {
                g2.setPaint(new GradientPaint(0, 0, PRIMARY, w, 0, ACCENT));
                g2.fill(new RoundRectangle2D.Float(0, 0, Math.max(fillW, h), h, h, h));
            }

            String text = target + "%";
            g2.setFont(font(Font.BOLD, 10));
            FontMetrics fm = g2.getFontMetrics();
            g2.setColor(Color.WHITE);
            g2.drawString(text, (w - fm.stringWidth(text)) / 2, (h + fm.getAscent() - fm.getDescent()) / 2);
            g2.dispose();
        }
    }

    /** Tombol bulat dengan warna & efek hover yang pasti tampil di semua OS. */
    private static class RoundButton extends JButton {
        RoundButton(String text) {
            super(text);
            setFont(font(Font.BOLD, 13));
            setForeground(Color.WHITE);
            setFocusPainted(false);
            setBorderPainted(false);
            setContentAreaFilled(false);   // kita gambar sendiri
            setOpaque(false);
            setRolloverEnabled(true);
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            setAlignmentX(LEFT_ALIGNMENT);
            setPreferredSize(new Dimension(300, 42));
        }

        @Override public Dimension getMaximumSize() {
            return new Dimension(Integer.MAX_VALUE, 42);
        }

        @Override protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            boolean hot = getModel().isRollover() || getModel().isArmed();
            g2.setColor(hot ? PRIMARY_DARK : PRIMARY);
            g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), 14, 14));

            g2.setFont(getFont());
            FontMetrics fm = g2.getFontMetrics();
            g2.setColor(getForeground());
            g2.drawString(getText(),
                (getWidth() - fm.stringWidth(getText())) / 2,
                (getHeight() + fm.getAscent() - fm.getDescent()) / 2);
            g2.dispose();
        }
    }

    /** Scrollbar gelap yang serasi dengan tema. */
    private static class DarkScrollBarUI extends BasicScrollBarUI {
        @Override protected void configureScrollBarColors() {
            thumbColor = SURFACE;
            trackColor = BG_DARK;
        }
        @Override protected JButton createDecreaseButton(int o) { return zeroButton(); }
        @Override protected JButton createIncreaseButton(int o) { return zeroButton(); }
        private JButton zeroButton() {
            JButton b = new JButton();
            b.setPreferredSize(new Dimension(0, 0));
            return b;
        }
        @Override protected void paintThumb(Graphics g, JComponent c, Rectangle r) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(isThumbRollover() ? TEXT_MUTED : thumbColor);
            g2.fillRoundRect(r.x + 2, r.y + 2, r.width - 4, r.height - 4, 8, 8);
            g2.dispose();
        }
        @Override protected void paintTrack(Graphics g, JComponent c, Rectangle r) {
            g.setColor(trackColor);
            g.fillRect(r.x, r.y, r.width, r.height);
        }
    }

    // ============================================================
    //  WINDOW UTAMA
    // ============================================================

    public AppDesktop() {
        setTitle("Portfolio PBP Desktop — " + NAMA);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(420, 520));
        setSize(500, 760);
        setLocationRelativeTo(null);
        getContentPane().setBackground(BG_DARK);
        setLayout(new BorderLayout());

        add(buildHeader(), BorderLayout.NORTH);
        add(buildContent(), BorderLayout.CENTER);
        add(buildFooter(), BorderLayout.SOUTH);
    }

    private JPanel buildHeader() {
        JPanel header = new GradientHeader();
        header.setPreferredSize(new Dimension(100, 150));   // lebar mengikuti window
        header.setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;

        JLabel name = new JLabel(NAMA);
        name.setFont(font(Font.BOLD, 23));
        name.setForeground(Color.WHITE);
        gbc.gridy = 0; gbc.insets = new Insets(10, 0, 2, 0);
        header.add(name, gbc);

        JLabel subtitle = new JLabel("NIM " + NIM + "  •  Kelas " + KELAS);
        subtitle.setFont(font(Font.PLAIN, 13));
        subtitle.setForeground(new Color(255, 255, 255, 200));
        gbc.gridy = 1; gbc.insets = new Insets(0, 0, 5, 0);
        header.add(subtitle, gbc);

        JLabel tag = new JLabel("S1 Teknik Informatika — UMC  |  Portfolio PBP (Java Swing)");
        tag.setFont(font(Font.ITALIC, 11));
        tag.setForeground(new Color(255, 255, 255, 170));
        gbc.gridy = 2;
        header.add(tag, gbc);

        return header;
    }

    private JScrollPane buildContent() {
        JPanel content = new ScrollPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBorder(BorderFactory.createEmptyBorder(20, 24, 20, 24));

        // --- Tentang ---
        content.add(createTextCard("Tentang Saya",
            NAMA + ", mahasiswa aktif di Universitas Muhammadiyah Cirebon yang mempelajari " +
            "Pemrograman Berbasis Platform. Menguasai Web, Desktop (Java), dan Mobile (Android)."));
        content.add(Box.createVerticalStrut(16));

        // --- Keahlian ---
        Card skills = new Card("Keahlian");
        String[][] data = {
            {"HTML & CSS", "90"},
            {"JavaScript", "75"},
            {"Java / Swing", "70"},
            {"Kotlin / Compose", "60"}
        };
        for (String[] s : data) {
            JPanel row = new JPanel(new BorderLayout(10, 0));
            row.setOpaque(false);
            row.setAlignmentX(LEFT_ALIGNMENT);
            row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 24));
            row.setPreferredSize(new Dimension(100, 24));

            JLabel label = new JLabel(s[0]);
            label.setFont(font(Font.PLAIN, 12));
            label.setForeground(TEXT_MUTED);
            label.setPreferredSize(new Dimension(115, 20));
            row.add(label, BorderLayout.WEST);
            row.add(new SkillBar(Integer.parseInt(s[1])), BorderLayout.CENTER);

            skills.add(Box.createVerticalStrut(8));
            skills.add(row);
        }
        content.add(skills);
        content.add(Box.createVerticalStrut(16));

        // --- Kontak ---
        content.add(createTextCard("Kontak",
            "Email  : " + EMAIL + "\n" +
            "GitHub : " + GITHUB + "\n" +
            "Lokasi : Cirebon, Jawa Barat"));
        content.add(Box.createVerticalStrut(16));

        // --- Tombol ---
        RoundButton open = new RoundButton("Buka Portfolio Web di Browser");
        open.addActionListener(e -> openWebPortfolio());
        content.add(open);
        content.add(Box.createVerticalStrut(10));

        RoundButton online = new RoundButton("Buka Versi Online (GitHub Pages)");
        online.addActionListener(e -> browse(WEB_ONLINE_URL));
        content.add(online);
        content.add(Box.createVerticalStrut(10));

        RoundButton mail = new RoundButton("Kirim Email ke Saya");
        mail.addActionListener(e -> browse("mailto:" + EMAIL));
        content.add(mail);

        content.add(Box.createVerticalGlue());

        JScrollPane scroll = new JScrollPane(content,
            ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED,
            ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        scroll.setBorder(null);
        scroll.getViewport().setBackground(BG_DARK);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        scroll.getVerticalScrollBar().setUI(new DarkScrollBarUI());
        scroll.getVerticalScrollBar().setPreferredSize(new Dimension(12, 0));
        return scroll;
    }

    private JPanel buildFooter() {
        JPanel footer = new JPanel();
        footer.setBackground(CARD_BG);
        footer.setPreferredSize(new Dimension(100, 36));
        JLabel text = new JLabel("© 2026 " + NAMA + " — Praktikum PBP UMC");
        text.setFont(font(Font.PLAIN, 11));
        text.setForeground(TEXT_MUTED);
        footer.add(text);
        return footer;
    }

    /** Kartu berisi teks yang otomatis turun baris sesuai lebar window. */
    private Card createTextCard(String title, String content) {
        Card card = new Card(title);
        card.add(Box.createVerticalStrut(8));

        JTextArea area = new JTextArea(content);
        area.setFont(font(Font.PLAIN, 12));
        area.setForeground(TEXT_MUTED);
        area.setBackground(CARD_BG);
        area.setEditable(false);
        area.setFocusable(false);
        area.setLineWrap(true);
        area.setWrapStyleWord(true);
        area.setBorder(null);
        area.setAlignmentX(LEFT_ALIGNMENT);
        card.add(area);
        return card;
    }

    // ============================================================
    //  AKSI
    // ============================================================

    /** Mencari index.html di folder kerja atau subfolder portfolio-pbp. */
    private static File findLocalIndex() {
        String[] candidates = {"index.html", "portfolio-pbp/index.html"};
        for (String path : candidates) {
            File f = new File(path);
            if (f.isFile()) return f.getAbsoluteFile();
        }
        return null;
    }

    private void openWebPortfolio() {
        if (!Desktop.isDesktopSupported() || !Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            info("Sistem ini tidak mendukung pembukaan browser dari aplikasi Java.");
            return;
        }
        try {
            File local = findLocalIndex();
            if (local != null) {
                Desktop.getDesktop().browse(local.toURI());      // langsung buka file, tanpa XAMPP
            } else {
                Desktop.getDesktop().browse(URI.create(WEB_FALLBACK_URL));
                info("File index.html tidak ditemukan di folder aplikasi, jadi dicoba lewat server lokal.\n" +
                     "Jika halaman tidak terbuka, jalankan XAMPP Apache dan letakkan folder di\n" +
                     "C:\\xampp\\htdocs\\portfolio-pbp\\  — atau jalankan aplikasi dari folder yang berisi index.html.");
            }
        } catch (Exception ex) {
            info("Gagal membuka browser:\n" + ex.getMessage());
        }
    }

    /** Buka URL apa pun (http/mailto) dengan penanganan error yang jelas. */
    private void browse(String url) {
        if (!Desktop.isDesktopSupported() || !Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            info("Sistem ini tidak mendukung pembukaan browser dari aplikasi Java.\nBuka manual: " + url);
            return;
        }
        try {
            Desktop.getDesktop().browse(URI.create(url));
        } catch (Exception ex) {
            info("Gagal membuka:\n" + url + "\n\n" + ex.getMessage());
        }
    }

    private void info(String message) {
        JOptionPane.showMessageDialog(this, message, "Info", JOptionPane.INFORMATION_MESSAGE);
    }

    // ============================================================
    //  MAIN
    // ============================================================
    public static void main(String[] args) {
        // Teks lebih halus di semua OS
        System.setProperty("awt.useSystemAAFontSettings", "on");
        System.setProperty("swing.aatext", "true");

        // Look & Feel lintas-platform agar tampilan sama di Windows/Mac/Linux
        try {
            UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
        } catch (Exception ignored) {}

        SwingUtilities.invokeLater(() -> new AppDesktop().setVisible(true));
    }
}

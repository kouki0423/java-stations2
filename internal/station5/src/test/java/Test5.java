import org.junit.Test;
import org.mockito.Answers;
import org.mockito.MockedStatic;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mockStatic;

public class Test5 {

    @Test
    public void 実行してもエラーが発生しない() {
        Station5.main(null);
    }

    @Test
    public void processメソッドが呼ばれている() {
        try (MockedStatic<Station5> station5 = mockStatic(Station5.class, Answers.CALLS_REAL_METHODS)) {
            station5.when(Station5::process).thenAnswer(i -> null);
            Station5.main(null);
            station5.verify(Station5::process);
        }
    }

    @Test
    public void processが例外をthrowする() {
        assertThrows(RuntimeException.class, Station5::process);
    }

    @Test
    public void メッセージが全て正しく出力される() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        System.setOut(new PrintStream(baos));
        Station5.main(null);
        String br = System.lineSeparator();
        String expected = "エラーが発生しました" + br + "処理が完了しました" + br;
        assertEquals(expected, baos.toString());
    }
}
